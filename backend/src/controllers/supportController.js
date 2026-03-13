import SupportTicket from "../models/SupportTicket.js";
import Student from "../models/student.js";
import Institution from "../models/institution.js";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/support");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images, documents, and archives are allowed."));
    }
  },
});

export const uploadSupportFiles = upload.array("attachments", 5); // Max 5 files

// Create a new support ticket
export const createSupportTicket = async (req, res) => {
  try {
    const { studentId, institutionId, category, subject, description, priority } = req.body;

    // Validate student and institution
    const student = await Student.findById(studentId);
    const institution = await Institution.findById(institutionId);

    if (!student || !institution) {
      return res.status(404).json({ 
        message: "Student or Institution not found" 
      });
    }

    // Check if student is associated with this institution
    const belongsToInstitution = (student.institutions || []).some((entry) => {
      const ref = entry?.institution || entry;
      return ref && String(ref) === String(institutionId);
    });

    if (!belongsToInstitution) {
      return res.status(403).json({ 
        message: "Student is not associated with this institution" 
      });
    }

    // Process uploaded files
    const attachments = req.files?.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      uploadedAt: new Date(),
    })) || [];

    const supportTicket = new SupportTicket({
      student: studentId,
      institution: institutionId,
      category,
      subject,
      description,
      priority: priority || "medium",
      attachments,
    });

    await supportTicket.save();
    
    // Populate for response
    await supportTicket.populate([
      { path: "student", select: "name email" },
      { path: "institution", select: "name" }
    ]);

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket: supportTicket,
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({ 
      message: "Failed to create support ticket", 
      error: error.message 
    });
  }
};

// Get all support tickets for a student
export const getStudentTickets = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { student: studentId };
    if (status) filter.status = status;

    const tickets = await SupportTicket.find(filter)
      .populate("institution", "name logo")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportTicket.countDocuments(filter);

    res.json({
      tickets,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching student tickets:", error);
    res.status(500).json({ 
      message: "Failed to fetch support tickets", 
      error: error.message 
    });
  }
};

// Get all support tickets for an institution
export const getInstitutionTickets = async (req, res) => {
  try {
    const institutionId = req.user.id; // Get institution ID from authenticated user
    const { status, category, priority, page = 1, limit = 10 } = req.query;

    const filter = { institution: institutionId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const tickets = await SupportTicket.find(filter)
      .populate("student", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportTicket.countDocuments(filter);

    res.json({
      tickets,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching institution tickets:", error);
    res.status(500).json({ 
      message: "Failed to fetch support tickets", 
      error: error.message 
    });
  }
};

// Get a specific support ticket
export const getSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await SupportTicket.findById(ticketId)
      .populate("student", "name email")
      .populate("institution", "name logo");

    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error fetching support ticket:", error);
    res.status(500).json({ 
      message: "Failed to fetch support ticket", 
      error: error.message 
    });
  }
};

// Institution responds to a support ticket
export const respondToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, respondedBy } = req.body;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    // Process uploaded response files
    const attachments = req.files?.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      uploadedAt: new Date(),
    })) || [];

    ticket.institutionResponse = {
      message,
      respondedBy: respondedBy || "Support Team",
      respondedAt: new Date(),
      attachments,
    };

    if (ticket.status === "open") {
      ticket.status = "in_progress";
    }

    await ticket.save();
    await ticket.populate([
      { path: "student", select: "name email" },
      { path: "institution", select: "name" }
    ]);

    res.json({
      message: "Response added successfully",
      ticket,
    });
  } catch (error) {
    console.error("Error responding to ticket:", error);
    res.status(500).json({ 
      message: "Failed to respond to ticket", 
      error: error.message 
    });
  }
};

// Mark ticket as addressed by institution
export const markAsAddressed = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    ticket.status = "addressed";
    ticket.addressedAt = new Date();

    await ticket.save();
    await ticket.populate([
      { path: "student", select: "name email" },
      { path: "institution", select: "name" }
    ]);

    res.json({
      message: "Ticket marked as addressed",
      ticket,
    });
  } catch (error) {
    console.error("Error marking ticket as addressed:", error);
    res.status(500).json({ 
      message: "Failed to mark ticket as addressed", 
      error: error.message 
    });
  }
};

// Student marks ticket as resolved
export const markAsResolved = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { rating, comment } = req.body;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    if (ticket.status !== "addressed") {
      return res.status(400).json({ 
        message: "Ticket must be addressed by institution before resolving" 
      });
    }

    ticket.status = "resolved";
    ticket.resolvedAt = new Date();

    if (rating || comment) {
      ticket.studentFeedback = { rating, comment };
    }

    await ticket.save();
    await ticket.populate([
      { path: "student", select: "name email" },
      { path: "institution", select: "name" }
    ]);

    res.json({
      message: "Ticket marked as resolved",
      ticket,
    });
  } catch (error) {
    console.error("Error marking ticket as resolved:", error);
    res.status(500).json({ 
      message: "Failed to mark ticket as resolved", 
      error: error.message 
    });
  }
};

// Update ticket priority (institution only)
export const updateTicketPriority = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { priority } = req.body;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    ticket.priority = priority;
    await ticket.save();

    res.json({
      message: "Ticket priority updated",
      ticket,
    });
  } catch (error) {
    console.error("Error updating ticket priority:", error);
    res.status(500).json({ 
      message: "Failed to update ticket priority", 
      error: error.message 
    });
  }
};

// Get support statistics for institution
export const getSupportStats = async (req, res) => {
  try {
    const institutionId = req.user.id; // Get institution ID from authenticated user

    const stats = await SupportTicket.aggregate([
      { $match: { institution: new mongoose.Types.ObjectId(institutionId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await SupportTicket.aggregate([
      { $match: { institution: new mongoose.Types.ObjectId(institutionId) } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await SupportTicket.aggregate([
      { $match: { institution: new mongoose.Types.ObjectId(institutionId) } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      statusStats: stats,
      categoryStats,
      priorityStats,
    });
  } catch (error) {
    console.error("Error fetching support stats:", error);
    res.status(500).json({ 
      message: "Failed to fetch support statistics", 
      error: error.message 
    });
  }
};
