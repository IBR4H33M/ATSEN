// backend/src/controllers/institution/roomController.js

import mongoose from "mongoose";
import Room from "../../models/Room.js";
import Student from "../../models/student.js";
import Instructor from "../../models/instructor.js";
import { findInstitutionByIdOrName } from "./utils.js";

// Get room details with populated students and instructors
export async function getRoomDetails(req, res) {
  console.log("=== GET ROOM DETAILS CALLED ===");
  console.log("Full URL:", req.originalUrl);
  console.log("Method:", req.method);
  console.log("Params:", req.params);

  try {
    const { idOrName, roomId } = req.params;

    console.log("Extracted params - idOrName:", idOrName, "roomId:", roomId);

    // Validate roomId format
    if (!roomId || !mongoose.isValidObjectId(roomId)) {
      console.log("Invalid roomId format:", roomId);
      return res.status(400).json({ message: "Invalid room ID format." });
    }

    console.log("About to call findInstitutionByIdOrName");
    const inst = await findInstitutionByIdOrName(idOrName);
    console.log("findInstitutionByIdOrName result:", inst);

    if (!inst) {
      console.log("Institution not found:", idOrName);
      return res.status(404).json({ message: "Institution not found." });
    }

    console.log("Found institution:", inst.name);

    console.log("About to query room with ID:", roomId);
    const room = await Room.findById(roomId)
      .populate("students", "name email")
      .populate("instructors", "name email")
      .populate("sections.students", "name email")
      .populate("sections.instructors", "name email");

    console.log(
      "Room query result:",
      room ? "Found room: " + room.room_name : "Not found"
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    // Add section assignments to student and instructor data
    const studentsWithSections = room.students.map((student) => {
      const studentSections = room.sections
        .filter((section) =>
          section.students.some(
            (s) => s._id.toString() === student._id.toString()
          )
        )
        .map((section) => ({
          sectionNumber: section.sectionNumber,
          classTimings: section.classTimings,
        }));

      return {
        ...student.toObject(),
        assignedSections: studentSections,
      };
    });

    const instructorsWithSections = room.instructors.map((instructor) => {
      const instructorSections = room.sections
        .filter((section) =>
          section.instructors.some(
            (i) => i._id.toString() === instructor._id.toString()
          )
        )
        .map((section) => ({
          sectionNumber: section.sectionNumber,
          classTimings: section.classTimings,
        }));

      return {
        ...instructor.toObject(),
        assignedSections: instructorSections,
      };
    });

    const roomWithSectionInfo = {
      ...room.toObject(),
      students: studentsWithSections,
      instructors: instructorsWithSections,
    };

    console.log("=== ROOM DETAILS RESPONSE ===");
    console.log("Room instructors count:", room.instructors?.length || 0);
    console.log("Room instructors:", room.instructors);
    console.log("Instructors with sections:", instructorsWithSections);

    console.log("Sending room data successfully");
    res.json(roomWithSectionInfo);
  } catch (err) {
    console.error("Get room details error:", err);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
}

// Remove student from room
export async function removeStudentFromRoom(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "Missing studentId." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    room.students = room.students.filter((id) => id.toString() !== studentId);
    await room.save();

    res.json({ message: "Student removed from room successfully." });
  } catch (err) {
    console.error("Remove student from room error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Remove instructor from room
export async function removeInstructorFromRoom(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { instructorId } = req.body;

    if (!instructorId) {
      return res.status(400).json({ message: "Missing instructorId." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    room.instructors = room.instructors.filter(
      (id) => id.toString() !== instructorId
    );
    await room.save();

    res.json({ message: "Instructor removed from room successfully." });
  } catch (err) {
    console.error("Remove instructor from room error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Add student to room
export async function addStudentToRoom(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Missing email." });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    // Check if already in room
    if (room.students.includes(student._id)) {
      return res.status(400).json({ message: "Student already in room." });
    }

    // Add to room
    room.students.push(student._id);
    await room.save();

    // Add room to student's rooms array
    if (!student.room.includes(roomId)) {
      student.room.push(roomId);
      await student.save();
    }

    res.json({ message: "Student added to room successfully." });
  } catch (err) {
    console.error("Add student to room error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Add instructor to room
export async function addInstructorToRoom(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Missing email." });
    }

    const instructor = await Instructor.findOne({ email });
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    // Check if already in room
    if (room.instructors.includes(instructor._id)) {
      return res.status(400).json({ message: "Instructor already in room." });
    }

    // Add to room
    room.instructors.push(instructor._id);
    await room.save();

    // Add room to instructor's rooms array
    if (!instructor.rooms.includes(roomId)) {
      instructor.rooms.push(roomId);
      await instructor.save();
    }

    res.json({ message: "Instructor added to room successfully." });
  } catch (err) {
    console.error("Add instructor to room error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Search institution students by email who are not already in this room
export async function searchAvailableStudentsForRoom(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { search = "" } = req.query;

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const room = await Room.findById(roomId).select("institution students");
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    if (
      room.institution &&
      room.institution.toString() !== institution._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Room doesn't belong to this institution." });
    }

    const term = search.trim();
    const roomStudentIds = (room.students || []).map((id) => id.toString());

    const filter = {
      institutions: institution._id,
      _id: { $nin: roomStudentIds },
    };

    if (term) {
      filter.email = { $regex: term, $options: "i" };
    }

    const students = await Student.find(filter)
      .select("name email institutions")
      .sort({ email: 1 })
      .limit(20)
      .lean();

    return res.json(students);
  } catch (err) {
    console.error("Search available students error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Search institution instructors by email who are not already in this room
export async function searchAvailableInstructorsForRoom(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { search = "" } = req.query;

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    const room = await Room.findById(roomId).select("institution instructors");
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    if (
      room.institution &&
      room.institution.toString() !== institution._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Room doesn't belong to this institution." });
    }

    const term = search.trim();
    const roomInstructorIds = (room.instructors || []).map((id) =>
      id.toString()
    );

    const filter = {
      institutions: institution._id,
      _id: { $nin: roomInstructorIds },
    };

    if (term) {
      filter.email = { $regex: term, $options: "i" };
    }

    const instructors = await Instructor.find(filter)
      .select("name email institutions")
      .sort({ email: 1 })
      .limit(20)
      .lean();

    return res.json(instructors);
  } catch (err) {
    console.error("Search available instructors error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Update room information (name, description, and sections)
export async function updateRoomInfo(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { room_name, description, sections } = req.body;

    console.log("=== UPDATE ROOM INFO ===");
    console.log("idOrName:", idOrName, "roomId:", roomId);
    console.log("Data:", { room_name, description, sections });

    // Validate input
    if (!room_name?.trim() || !description?.trim()) {
      return res
        .status(400)
        .json({ message: "Room name and description are required." });
    }

    // Validate sections if provided
    if (sections) {
      if (sections.length < 1) {
        return res.status(400).json({
          message: "Room must have at least 1 section",
        });
      }

      // Validate each section
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
    }

    // Validate roomId format
    if (!roomId || !mongoose.isValidObjectId(roomId)) {
      return res.status(400).json({ message: "Invalid room ID format." });
    }

    // Find institution
    const inst = await findInstitutionByIdOrName(idOrName);
    if (!inst) {
      return res.status(404).json({ message: "Institution not found." });
    }

    // Find and update room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    // Verify room belongs to institution
    if (
      room.institution &&
      room.institution.toString() !== inst._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Room doesn't belong to this institution." });
    }

    // Update room
    room.room_name = room_name.trim();
    room.description = description.trim();
    if (sections) {
      room.sections = sections;
    }
    const updatedRoom = await room.save();

    // Populate for response
    await updatedRoom.populate("students", "name email");
    await updatedRoom.populate("instructors", "name email");

    console.log("Room updated successfully:", updatedRoom.room_name);
    res.json(updatedRoom);
  } catch (err) {
    console.error("Update room info error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}
