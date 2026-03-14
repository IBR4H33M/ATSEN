import express from "express";
import {
  loginAdmin,
  getPendingInstitutions,
  approveInstitution,
  rejectInstitution,
  getAllInstitutions,
  deleteInstitution,
  getSystemStatus,
  setInstitutionActive,
  getSupportMessages,
  deleteSupportMessage,
} from "../controllers/adminController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/admin/login
router.post("/login", loginAdmin);

// Protected routes
router.get(
  "/institutions",
  verifyToken,
  getAllInstitutions
);

router.get(
  "/institutions/pending",
  verifyToken,
  getPendingInstitutions
);

router.post(
  "/institutions/:id/approve",
  verifyToken,
  approveInstitution
);

router.post(
  "/institutions/:id/reject",
  verifyToken,
  rejectInstitution
);

// Delete an approved institution
router.delete("/institutions/:id", verifyToken, deleteInstitution);

// Activate/Deactivate an institution
router.patch("/institutions/:id/active", verifyToken, setInstitutionActive);

// System status checks
router.get("/system-status", verifyToken, getSystemStatus);

// Contact/support messages from public contact page
router.get("/support-messages", verifyToken, getSupportMessages);
router.delete("/support-messages/:id", verifyToken, deleteSupportMessage);

export default router;