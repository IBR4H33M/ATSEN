import express from "express";
import {
  createContactMessage,
  getPublicContactInfo,
} from "../controllers/contactController.js";

const router = express.Router();

router.get("/info", getPublicContactInfo);
router.post("/messages", createContactMessage);

export default router;
