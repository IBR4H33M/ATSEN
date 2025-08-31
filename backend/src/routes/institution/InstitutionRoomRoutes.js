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
router.get("/:idOrName/rooms", listRooms);

// GET available time slots for room creation
router.get("/:idOrName/rooms/time-slots", getAvailableTimeSlots);

// POST /api/institutions/:idOrName/rooms
router.post("/:idOrName/rooms", createRoom);
router.post("/:idOrName/rooms/add-room", createRoom);

// Room details and management
router.get("/:idOrName/rooms/:roomId", getRoomDetails);
router.get("/:idOrName/rooms/:roomId/sections", getRoomSections);
router.put("/:idOrName/rooms/:roomId", updateRoomInfo);
router.put("/:idOrName/rooms/:roomId/sections", updateRoomSections);
router.delete("/:idOrName/rooms/:roomId", deleteRoom);

// Legacy user management (for backward compatibility)
router.post("/:idOrName/rooms/:roomId/add-student", addStudentToRoom);
router.post("/:idOrName/rooms/:roomId/add-instructor", addInstructorToRoom);
router.post("/:idOrName/rooms/:roomId/remove-student", removeStudentFromRoom);
router.post("/:idOrName/rooms/:roomId/remove-instructor", removeInstructorFromRoom);

// New section-based user management
router.post("/:idOrName/rooms/:roomId/assign-student-section", assignStudentToSection);
router.post("/:idOrName/rooms/:roomId/assign-instructor-sections", assignInstructorToSections);
router.get("/:idOrName/rooms/:roomId/user-sections/:userId", getUserSections);
router.delete("/:idOrName/rooms/:roomId/remove-user-sections/:userId", removeUserFromSections);

export default router;
