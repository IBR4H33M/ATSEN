//backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { connectDB } from "./config/db.js";
import rateLimiter from "./middlewares/rateLimiter.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import institutionRoutes from "./routes/institutionRoutes.js";
import institutionRoomRoutes from "./routes/institution/InstitutionRoomRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import roomsRoutes from "./routes/roomsRoutes.js";
import forumContentRoutes from "./routes/forumContentRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import quizGradeRoutes from "./routes/quizGradeRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import institutionAnnouncementRoutes from "./routes/institutionAnnouncementRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// enable CORS - more restrictive in production
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, process.env.DEPLOY_URL].filter(Boolean)
      : "*",
    credentials: false,
  })
);

// parse JSON bodies
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// optional rate limiting
// app.use(rateLimiter);

// simple DB‐status check
app.get("/api/db-status", (req, res) => {
  const conn = mongoose.connection;
  res.json({
    readyState: conn.readyState,
    host: conn.host,
    name: conn.name,
    port: conn.port,
    isAtlas: conn.host?.includes("mongodb.net"),
    message: conn.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// Test download route
app.get("/api/test-download", (req, res) => {
  res.json({ message: "Download route is working" });
});

// mount your routers
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// → Institutions (plural)
app.use("/api/institutions", institutionRoutes);

// → Nested “rooms” under an institution
app.use("/api/institutions/:idOrName/rooms", institutionRoomRoutes);

app.use("/api/instructors", instructorRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/forum-content", forumContentRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/quiz-grades", quizGradeRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/chat", chatRoutes);

// Direct download route
app.get("/api/download/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { default: Submission } = await import("./models/Submission.js");
    const fs = await import("fs");

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (!fs.existsSync(submission.filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(submission.filePath, submission.fileName);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.use("/api/documents", documentRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/institution-announcements", institutionAnnouncementRoutes);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  // Handle React routing - send all non-API requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// connect to DB, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});
