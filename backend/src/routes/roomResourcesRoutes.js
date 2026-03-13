import express from "express";
import RoomResource from "../models/RoomResource.js";
import Room from "../models/Room.js";
import Student from "../models/student.js";
import Instructor from "../models/instructor.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/room/:roomId", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId).select("students instructors institution");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (req.user.role === "student") {
      const student = await Student.findById(req.user.id).select("room");
      const isInRoom = (student?.room || []).some((entry) => String(entry) === String(roomId));
      if (!isInRoom) return res.status(403).json({ message: "Not authorized to view these resources" });
    }

    if (req.user.role === "instructor") {
      const instructor = await Instructor.findById(req.user.id).select("rooms");
      const isInRoom = (instructor?.rooms || []).some((entry) => String(entry) === String(roomId));
      if (!isInRoom) return res.status(403).json({ message: "Not authorized to view these resources" });
    }

    if (req.user.role === "institution" && String(room.institution) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to view these resources" });
    }

    const resources = await RoomResource.find({ room: roomId })
      .populate("uploadedBy", "name email")
      .populate("institutionId", "name slug")
      .sort({ order: 1, createdAt: -1 });

    res.json(resources);
  } catch (error) {
    console.error("Error fetching room resources:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

router.post("/room/:roomId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can create resources" });
    }

    const { roomId } = req.params;
    const room = await Room.findById(roomId).select("institution instructors");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isInstructorOfRoom = (room.instructors || []).some((entry) => String(entry) === String(req.user.id));
    if (!isInstructorOfRoom) {
      return res.status(403).json({ message: "Not authorized to add resources to this room" });
    }

    const created = await RoomResource.create({
      room: roomId,
      title: req.body.title,
      type: req.body.type,
      url: req.body.url,
      content: req.body.content,
      order: req.body.order ?? 0,
      uploadedBy: req.user.id,
      institutionId: room.institution,
    });

    const populated = await RoomResource.findById(created._id)
      .populate("uploadedBy", "name email")
      .populate("institutionId", "name slug");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(500).json({ message: "Failed to create resource", details: error.message });
  }
});

router.put("/:resourceId", authMiddleware, async (req, res) => {
  try {
    const resource = await RoomResource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can update resources" });
    }

    const room = await Room.findById(resource.room).select("instructors");
    const isInstructorOfRoom = (room?.instructors || []).some((entry) => String(entry) === String(req.user.id));
    if (!isInstructorOfRoom) {
      return res.status(403).json({ message: "Not authorized to edit this resource" });
    }

    const updated = await RoomResource.findByIdAndUpdate(
      req.params.resourceId,
      {
        title: req.body.title,
        type: req.body.type,
        url: req.body.url,
        content: req.body.content,
        order: req.body.order,
      },
      { new: true, runValidators: true }
    )
      .populate("uploadedBy", "name email")
      .populate("institutionId", "name slug");

    res.json(updated);
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ message: "Failed to update resource" });
  }
});

router.delete("/:resourceId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can delete resources" });
    }

    const resource = await RoomResource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const room = await Room.findById(resource.room).select("instructors");
    const isInstructorOfRoom = (room?.instructors || []).some((entry) => String(entry) === String(req.user.id));
    if (!isInstructorOfRoom) {
      return res.status(403).json({ message: "Not authorized to delete this resource" });
    }

    await RoomResource.findByIdAndDelete(req.params.resourceId);
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ message: "Failed to delete resource" });
  }
});

export default router;
