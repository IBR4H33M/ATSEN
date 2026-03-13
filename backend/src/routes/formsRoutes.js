import express from "express";
import FormEntry, { FormResponse } from "../models/Form.js";
import Room from "../models/Room.js";
import Institution from "../models/institution.js";
import Student from "../models/student.js";
import Instructor from "../models/instructor.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { institutionId, institutionSlug, roomId } = req.query;
    let query = { isActive: true };

    if (institutionId) {
      query.institutionId = institutionId;
    } else if (institutionSlug) {
      const institution = await Institution.findOne({ slug: institutionSlug });
      if (institution) query.institutionId = institution._id;
    }

    if (roomId) {
      query.$or = [
        { createdFor: "institution", institutionId: query.institutionId },
        { createdFor: "room", targetRoomId: roomId },
      ];
    }

    let forms = await FormEntry.find(query)
      .populate("targetInstructorId", "name email")
      .populate("institutionId", "name slug")
      .populate("targetRoomId", "room_name")
      .sort({ createdAt: -1 });

    if (req.user.role === "student") {
      const student = await Student.findById(req.user.id).select("institutions room");
      const studentRoomIds = (student?.room || []).map((entry) => String(entry));
      const studentInstitutionIds = (student?.institutions || []).map((entry) => String(entry));

      forms = forms.filter((form) => {
        const sameInstitution = !form.institutionId || studentInstitutionIds.includes(String(form.institutionId._id || form.institutionId));
        if (!sameInstitution) return false;
        if (form.createdFor === "room") {
          return form.targetRoomId && studentRoomIds.includes(String(form.targetRoomId._id || form.targetRoomId));
        }
        return true;
      });
    }

    if (req.user.role === "instructor") {
      const instructor = await Instructor.findById(req.user.id).select("institutions rooms");
      const instructorInstitutionIds = (instructor?.institutions || []).map((entry) => String(entry));
      const instructorRoomIds = (instructor?.rooms || []).map((entry) => String(entry));
      forms = forms.filter((form) => {
        const sameInstitution = !form.institutionId || instructorInstitutionIds.includes(String(form.institutionId._id || form.institutionId));
        if (!sameInstitution) return false;
        if (form.createdFor === "room") {
          return form.targetRoomId && instructorRoomIds.includes(String(form.targetRoomId._id || form.targetRoomId));
        }
        return true;
      });
    }

    if (req.user.role === "institution") {
      forms = forms.filter((form) => String(form.institutionId?._id || form.institutionId) === String(req.user.id));
    }

    res.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Failed to fetch forms" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    if (!["institution", "instructor"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed to create forms" });
    }

    const {
      title,
      description,
      kind,
      options,
      customQuestions,
      targetInstructorId,
      targetInstructorName,
      createdFor,
      targetRoomId,
      institutionId,
      institutionSlug,
    } = req.body;

    let finalInstitutionId = institutionId;
    if (!finalInstitutionId && institutionSlug) {
      const institution = await Institution.findOne({ slug: institutionSlug });
      if (institution) finalInstitutionId = institution._id;
    }
    if (!finalInstitutionId) {
      return res.status(400).json({ message: "Institution ID or slug is required" });
    }

    if (req.user.role === "institution" && String(finalInstitutionId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Cannot create forms for another institution" });
    }

    if (req.user.role === "instructor") {
      const instructor = await Instructor.findById(req.user.id).select("institutions rooms name");
      const sameInstitution = (instructor?.institutions || []).some((entry) => String(entry) === String(finalInstitutionId));
      if (!sameInstitution) {
        return res.status(403).json({ message: "Instructor is not assigned to this institution" });
      }
      if (createdFor === "room") {
        const hasRoom = (instructor?.rooms || []).some((entry) => String(entry) === String(targetRoomId));
        if (!hasRoom) {
          return res.status(403).json({ message: "Instructor is not assigned to this room" });
        }
      }
    }

    let finalInstructorName = targetInstructorName || "";
    if (kind === "evaluation" && targetInstructorId && !finalInstructorName) {
      const instructor = await Instructor.findById(targetInstructorId).select("name");
      if (instructor) finalInstructorName = instructor.name;
    }

    const created = await FormEntry.create({
      title,
      description,
      kind,
      options: options || [],
      customQuestions: customQuestions || [],
      institutionId: finalInstitutionId,
      institutionSlug,
      createdFor: createdFor || "institution",
      createdBy: req.user.id,
      targetInstructorId: targetInstructorId || undefined,
      targetInstructorName: finalInstructorName,
      targetRoomId: targetRoomId || undefined,
    });

    const populated = await FormEntry.findById(created._id)
      .populate("targetInstructorId", "name email")
      .populate("institutionId", "name slug")
      .populate("targetRoomId", "room_name");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ message: "Failed to create form" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const form = await FormEntry.findById(req.params.id)
      .populate("targetInstructorId", "name email")
      .populate("institutionId", "name slug")
      .populate("targetRoomId", "room_name");
    if (!form) return res.status(404).json({ message: "Form not found" });

    const responses = await FormResponse.find({ formId: form._id })
      .populate("studentId", "name email")
      .populate("targetInstructorId", "name email")
      .sort({ createdAt: -1 });

    res.json({ poll: form, responses });
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ message: "Failed to fetch form" });
  }
});

router.post("/:id/vote", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can submit responses" });
    }

    const form = await FormEntry.findById(req.params.id);
    if (!form) return res.status(404).json({ message: "Form not found" });
    if (!form.isActive) return res.status(400).json({ message: "Form is inactive" });

    const student = await Student.findById(req.user.id).select("institutions room name");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const belongsToInstitution = (student.institutions || []).some((entry) => String(entry) === String(form.institutionId));
    if (!belongsToInstitution) {
      return res.status(403).json({ message: "Not permitted to respond to this form" });
    }

    if (form.createdFor === "room" && form.targetRoomId) {
      const isInRoom = (student.room || []).some((entry) => String(entry) === String(form.targetRoomId));
      if (!isInRoom) {
        return res.status(403).json({ message: "Not permitted to respond to this room form" });
      }
    }

    const existing = await FormResponse.findOne({ formId: form._id, studentId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "You have already submitted a response to this form" });
    }

    const created = await FormResponse.create({
      formId: form._id,
      studentId: req.user.id,
      studentName: student.name,
      optionId: req.body.optionId,
      textAnswer: req.body.textAnswer,
      targetInstructorId: req.body.targetInstructorId || undefined,
      satisfactionLevel: req.body.satisfactionLevel,
      contentDeliveryRating: req.body.contentDeliveryRating,
      recommendations: req.body.recommendations,
      customResponses: req.body.customResponses || [],
    });

    const populated = await FormResponse.findById(created._id)
      .populate("studentId", "name email")
      .populate("targetInstructorId", "name email");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ message: "Failed to submit response" });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "institution") {
      return res.status(403).json({ message: "Only institutions can update forms" });
    }
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const form = await FormEntry.findById(req.params.id);
    if (!form) return res.status(404).json({ message: "Form not found" });
    if (String(form.institutionId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not permitted to update this form" });
    }

    form.title = title.trim();
    await form.save();

    const updated = await FormEntry.findById(req.params.id)
      .populate("targetInstructorId", "name email")
      .populate("institutionId", "name slug")
      .populate("targetRoomId", "room_name");

    res.json(updated);
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(500).json({ message: "Failed to update form" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "institution") {
      return res.status(403).json({ message: "Only institutions can delete forms" });
    }

    const form = await FormEntry.findById(req.params.id);
    if (!form) return res.status(404).json({ message: "Form not found" });
    if (String(form.institutionId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not permitted to delete this form" });
    }

    await FormResponse.deleteMany({ formId: form._id });
    await FormEntry.findByIdAndDelete(req.params.id);
    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ message: "Failed to delete form" });
  }
});

export default router;
