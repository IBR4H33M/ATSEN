// backend/src/controllers/institution/CreateRoomController.js

import mongoose from "mongoose";
import Institution from "../../models/institution.js";
import Room from "../../models/Room.js";
import Instructor from "../../models/instructor.js";
import Student from "../../models/student.js";
import Assessment from "../../models/Assessment.js";
import Material from "../../models/Material.js";
import ForumContent from "../../models/ForumContent.js";
import ChatMessage from "../../models/ChatMessage.js";
import Grade from "../../models/Grade.js";
import Submission from "../../models/Submission.js";
import QuizGrade from "../../models/QuizGrade.js";
import StudentAchievement from "../../models/StudentAchievement.js";

/**
 * Inline helper to find an institution by ID, slug or case-insensitive name
 */
async function findInstitution(idOrName) {
  if (mongoose.Types.ObjectId.isValid(idOrName)) {
    return Institution.findById(idOrName);
  }
  return Institution.findOne({
    $or: [{ slug: idOrName }, { name: new RegExp(`^${idOrName}$`, "i") }],
  });
}

/**
 * POST /api/institutions/:idOrName/add-room
 */
export async function createRoom(req, res) {
  try {
    const { idOrName } = req.params;
    const { room_name, description, instructors = [], sections } = req.body;

    console.log("=== ROOM CREATION BACKEND ===");
    console.log("Received data:", {
      room_name,
      description,
      instructors,
      sections,
    });
    console.log("Instructors array:", instructors);
    console.log("Number of sections:", sections?.length);

    // validate required fields
    if (!room_name) {
      return res.status(400).json({ message: "room_name is required" });
    }
    if (description == null) {
      return res.status(400).json({ message: "description is required" });
    }

    // Validate sections
    if (!sections || sections.length < 1) {
      return res.status(400).json({
        message: "Room must have at least 1 section with class timings",
      });
    }

    // Validate that each section has at least 1 class timing
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section.classTimings || section.classTimings.length < 1) {
        return res.status(400).json({
          message: `Section ${i + 1} must have at least 1 class timing`,
        });
      }
      // Ensure section number is correct
      section.sectionNumber = i + 1;
    }

    // lookup institution
    const inst = await findInstitution(idOrName);
    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // Extract all unique instructors from sections
    const sectionInstructors = new Set();
    sections.forEach((section) => {
      if (section.instructors && Array.isArray(section.instructors)) {
        section.instructors.forEach((instructorId) => {
          if (instructorId) {
            sectionInstructors.add(instructorId.toString());
          }
        });
      }
    });

    // Combine instructors from request and sections
    const allInstructors = Array.isArray(instructors) ? [...instructors] : [];
    sectionInstructors.forEach((instructorId) => {
      if (!allInstructors.includes(instructorId)) {
        allInstructors.push(instructorId);
      }
    });

    console.log("Section instructors found:", Array.from(sectionInstructors));
    console.log("All instructors for room:", allInstructors);

    // create new room
    const room = await Room.create({
      room_name,
      description,
      instructors: allInstructors,
      institution: inst._id,
      sections,
    });

    // Update instructor records to include this room and section assignments
    if (allInstructors.length > 0) {
      // Add room to instructors' rooms array
      await Instructor.updateMany(
        { _id: { $in: allInstructors } },
        { $addToSet: { rooms: room._id } }
      );

      // Update instructor section assignments
      for (const instructorId of allInstructors) {
        const instructorSections = [];
        sections.forEach((section) => {
          if (
            section.instructors &&
            section.instructors.includes(instructorId)
          ) {
            instructorSections.push(section.sectionNumber);
          }
        });

        if (instructorSections.length > 0) {
          await Instructor.findByIdAndUpdate(instructorId, {
            $addToSet: {
              roomSections: {
                roomId: room._id,
                sectionNumbers: instructorSections,
              },
            },
          });
        }
      }

      console.log(
        "Updated instructor records with room ID and section assignments"
      );
    }

    // Add the room to the institution's rooms array
    await Institution.findByIdAndUpdate(
      inst._id,
      { $push: { rooms: room._id } },
      { new: true }
    );

    return res.status(201).json(room);
  } catch (err) {
    console.error("Error in createRoom:", err);
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: err.errors });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /api/institutions/:idOrName/rooms
 */
export async function listRooms(req, res) {
  try {
    const { idOrName } = req.params;
    const inst = await findInstitution(idOrName);

    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const rooms = await Room.find({ institution: inst._id }).lean();
    console.log("=== LIST ROOMS DEBUG ===");
    console.log("Institution ID:", inst._id);
    console.log("Found rooms count:", rooms.length);
    rooms.forEach((room, index) => {
      console.log(`Room ${index}:`, {
        id: room._id,
        name: room.room_name,
        idType: typeof room._id,
        idLength: room._id?.toString().length,
      });
    });
    return res.json(rooms);
  } catch (err) {
    console.error("Error in listRooms:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /api/institutions/:idOrName/instructors
 */
export async function getInstitutionInstructors(req, res) {
  try {
    const { idOrName } = req.params;
    const inst = await findInstitution(idOrName);

    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // assumes Instructor schema has 'institutions: [ObjectId]'
    const instructors = await Instructor.find({
      institutions: inst._id,
    }).lean();

    return res.json(instructors);
  } catch (err) {
    console.error("Error in getInstitutionInstructors:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * DELETE /api/institutions/:idOrName/rooms/:roomId
 */
export async function deleteRoom(req, res) {
  try {
    const { idOrName, roomId } = req.params;

    // Validate roomId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    // Find institution
    const inst = await findInstitution(idOrName);
    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // Find room and verify it belongs to this institution
    const room = await Room.findOne({ _id: roomId, institution: inst._id });
    if (!room) {
      return res.status(404).json({
        message: "Room not found or doesn't belong to this institution",
      });
    }

    // CASCADING DELETES - Delete all room-related data
    console.log(`Starting cascading delete for room ${roomId}`);

    // 1. Get all assessments for this room (needed for related data cleanup)
    const assessments = await Assessment.find({ room: roomId });
    const assessmentIds = assessments.map((a) => a._id);

    if (assessmentIds.length > 0) {
      // Delete all submissions for these assessments
      const deletedSubmissions = await Submission.deleteMany({
        assessment: { $in: assessmentIds },
      });
      console.log(`Deleted ${deletedSubmissions.deletedCount} submissions`);

      // Delete all quiz grades for these assessments
      const deletedQuizGrades = await QuizGrade.deleteMany({
        assessment: { $in: assessmentIds },
      });
      console.log(`Deleted ${deletedQuizGrades.deletedCount} quiz grades`);
    }

    // 2. Delete all assessments for this room
    const deletedAssessments = await Assessment.deleteMany({ room: roomId });
    console.log(`Deleted ${deletedAssessments.deletedCount} assessments`);

    // 3. Delete all materials for this room
    const deletedMaterials = await Material.deleteMany({ room: roomId });
    console.log(`Deleted ${deletedMaterials.deletedCount} materials`);

    // 4. Delete all forum content (announcements and discussions) for this room
    const deletedForumContent = await ForumContent.deleteMany({ room: roomId });
    console.log(
      `Deleted ${deletedForumContent.deletedCount} forum content items`
    );

    // 5. Delete all chat messages for this room
    const deletedChatMessages = await ChatMessage.deleteMany({ room: roomId });
    console.log(`Deleted ${deletedChatMessages.deletedCount} chat messages`);

    // 6. Delete all grades for this room
    const deletedGrades = await Grade.deleteMany({ room: roomId });
    console.log(`Deleted ${deletedGrades.deletedCount} grade records`);

    // 7. Delete any student achievements related to this room
    const deletedAchievements = await StudentAchievement.deleteMany({
      room: roomId,
    });
    console.log(
      `Deleted ${deletedAchievements.deletedCount} student achievements`
    );

    // 8. Remove room references from user accounts
    // Remove room ID from institution's rooms array
    await Institution.findByIdAndUpdate(inst._id, { $pull: { rooms: roomId } });

    // Remove room ID from all students' room arrays
    await Student.updateMany({ room: roomId }, { $pull: { room: roomId } });

    // Remove room ID from all instructors' room arrays
    await Instructor.updateMany(
      { rooms: roomId },
      { $pull: { rooms: roomId } }
    );

    // Clean up related room data
    // Import the models at the top if not already imported
    const { default: Material } = await import("../../models/Material.js");
    const { default: RoomResource } = await import("../../models/RoomResource.js");
    const { default: Assessment } = await import("../../models/Assessment.js");
    const { default: ForumContent } = await import("../../models/ForumContent.js");
    const { default: FormEntry } = await import("../../models/Form.js");

    // Delete all room-related data
    await Promise.all([
      Material.deleteMany({ room: roomId }),
      RoomResource.deleteMany({ room: roomId }),
      Assessment.deleteMany({ room: roomId }),
      ForumContent.deleteMany({ room: roomId }),
      FormEntry.deleteMany({ targetRoomId: roomId })
    ]);

    // 9. Finally, delete the room itself
    await Room.findByIdAndDelete(roomId);

    console.log(`Room ${roomId} and all related data deleted successfully`);
    return res.json({
      message: "Room and all related data deleted successfully",
      details: {
        assessments: deletedAssessments.deletedCount,
        submissions: assessmentIds.length > 0 ? "deleted" : 0,
        quizGrades: assessmentIds.length > 0 ? "deleted" : 0,
        materials: deletedMaterials.deletedCount,
        forumContent: deletedForumContent.deletedCount,
        chatMessages: deletedChatMessages.deletedCount,
        grades: deletedGrades.deletedCount,
        achievements: deletedAchievements.deletedCount,
      },
    });
  } catch (err) {
    console.error("Error in deleteRoom:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
