// backend/src/routes/institution/InstitutionRoomRoutes.js

import express from "express";
import {
  createRoom,
  listRooms,
  deleteRoom,
} from "../../controllers/institution/CreateRoomController.js";

import {
  getRoomDetails,
  removeStudentFromRoom,
  removeInstructorFromRoom,
  addStudentToRoom,
  addInstructorToRoom,
  searchAvailableStudentsForRoom,
  searchAvailableInstructorsForRoom,
  updateRoomInfo,
} from "../../controllers/institution/roomController.js";

import {
  getAvailableTimeSlots,
  getRoomSections,
  updateRoomSections,
} from "../../controllers/roomsController.js";

import {
  assignStudentToSection,
  assignInstructorToSections,
  getUserSections,
  removeUserFromSections,
} from "../../controllers/institution/sectionController.js";

const router = express.Router({ mergeParams: true });

// GET  /api/institutions/:idOrName/rooms
router.get("/", listRooms);

// GET available time slots for room creation
router.get("/time-slots", getAvailableTimeSlots);

// POST /api/institutions/:idOrName/rooms
router.post("/", createRoom);
router.post("/add-room", createRoom);

// Room details and management
router.get("/:roomId", getRoomDetails);
router.get("/:roomId/sections", getRoomSections);
router.put("/:roomId", updateRoomInfo);
router.put("/:roomId/sections", updateRoomSections);
router.delete("/:roomId", deleteRoom);

// Legacy user management (for backward compatibility)
router.post("/:roomId/add-student", addStudentToRoom);
router.post("/:roomId/add-instructor", addInstructorToRoom);
router.post("/:roomId/remove-student", removeStudentFromRoom);
router.post("/:roomId/remove-instructor", removeInstructorFromRoom);

// Search available institution users by email (excluding users already in room)
router.get("/:roomId/search-students", searchAvailableStudentsForRoom);
router.get("/:roomId/search-instructors", searchAvailableInstructorsForRoom);

// New section-based user management
router.post("/:roomId/assign-student-section", assignStudentToSection);
router.post("/:roomId/assign-instructor-sections", assignInstructorToSections);
router.get("/:roomId/user-sections/:userId", getUserSections);
router.delete("/:roomId/remove-user-sections/:userId", removeUserFromSections);

export default router;
