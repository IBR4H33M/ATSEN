// backend/src/routes/institutionRoutes.js

import { Router } from "express";
// Auth
import {
  registerInstitution,
  loginInstitution
} from "../controllers/institution/authController.js";

// Dashboard
import {
  getInstitutionDashboard
} from "../controllers/institution/dashboardController.js";

import { getAccessControl, addAdmin } from "../controllers/institution/accessController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

// People management
import {
  getInstitutionInstructors,
  getInstitutionStudents,
  addInstructorToInstitution,
  addStudent,
  removeStudent,
  removeInstructor
} from "../controllers/institution/peopleController.js";



// Settings
import {
  updateInstitutionSettings
} from "../controllers/institution/settingsController.js";

const router = Router();

// Register and login
router.post("/register", registerInstitution);
router.post("/login",    loginInstitution);

// List instructors for an institution
router.get("/:idOrName/instructors", getInstitutionInstructors);

// List students for an institution
router.get("/:idOrName/students", getInstitutionStudents);

// Add an instructor to an institution
router.post("/:idOrName/add-instructor", addInstructorToInstitution);

// Fetch dashboard data
router.get("/:idOrName/dashboard", getInstitutionDashboard);

// Update institution settings
router.put("/:idOrName/settings", updateInstitutionSettings);

// Access control - list and add admins
router.get("/:idOrName/access-control", getAccessControl);
router.post("/:idOrName/access-control", addAdmin);

router.post("/:idOrName/add-student", addStudent);
router.post("/:idOrName/remove-student", removeStudent);
router.post("/:idOrName/remove-instructor", removeInstructor);



export default router;