//backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import rateLimiter from "./middlewares/rateLimiter.js";

// Import all models to ensure they are registered
import "./models/index.js";

// Import all models to ensure they are registered
import "./models/index.js";

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
import yuvrajPollsRoutes from "./routes/yuvraj_pollsRoutes.js";
import yuvrajResourcesRoutes from "./routes/yuvraj_resourcesRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import linkPreviewRoutes from "./routes/linkPreviewRoutes.js";
import helpDeskRoutes from "./routes/helpDeskRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// enable CORS for all origins
app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

// parse JSON bodies
app.use(express.json());

// URL canonicalization middleware
app.use((req, res, next) => {
  const host = req.get('host');
  
  // Redirect www to non-www
  if (host && host.startsWith('www.')) {
    return res.redirect(301, `https://${host.slice(4)}${req.originalUrl}`);
  }
  
  // Remove trailing slash (except root)
  if (req.path.length > 1 && req.path.endsWith('/')) {
    return res.redirect(301, req.path.slice(0, -1));
  }
  
  next();
});

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

// Health check endpoint for deployment platforms
app.get("/health", (req, res) => {
  const conn = mongoose.connection;
  if (conn.readyState === 1) {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } else {
    res.status(503).json({ 
      status: "unhealthy", 
      timestamp: new Date().toISOString(),
      database: "disconnected"
    });
  }
});

// Root API test route
app.get("/api", (req, res) => {
  res.json({ 
    message: "ATSEN API is running", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
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
app.use("/api/yuvraj-polls", yuvrajPollsRoutes);
app.use("/api/yuvraj-resources", yuvrajResourcesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/link-preview", linkPreviewRoutes);
app.use("/api/helpdesk", helpDeskRoutes);

// Production: Serve React app (MUST be after all API routes)
if (process.env.NODE_ENV === 'production') {
  // Serve from frontend/dist directory
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  console.log(`📁 Serving static files from: ${frontendPath}`);
  
  app.use(express.static(frontendPath));
  
  // Handle React routing - catch all non-API routes using regex
  app.get(/^(?!\/api).*/, (req, res) => {
    const indexPath = path.join(frontendPath, 'index.html');
    console.log(`📄 Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(404).send('Page not found');
      }
    });
  });
}

// connect to DB, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Static files path: ${path.join(__dirname, '../../frontend/dist')}`);
  });
}).catch((error) => {
  console.error("Failed to connect to database:", error);
  process.exit(1);
});
