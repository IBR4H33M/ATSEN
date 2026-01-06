import Material from "../models/Material.js";
import Room from "../models/Room.js";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs";

// Configure S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: 'sgp1',
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

// Debug: Log configuration (remove in production)
console.log('Spaces Config:', {
  endpoint: process.env.DO_SPACES_ENDPOINT,
  bucket: process.env.DO_SPACES_BUCKET,
  hasKey: !!process.env.DO_SPACES_ACCESS_KEY_ID,
  hasSecret: !!process.env.DO_SPACES_SECRET_ACCESS_KEY
});

// Configure multer for Backblaze B2 uploads (private bucket)
const storage = multerS3({
  s3: s3Client,
  bucket: process.env.DO_SPACES_BUCKET,
  acl: 'private', // Keep files private
  key: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `materials/${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const uploadMiddleware = upload.single('pdfFile');

// Get all materials for a room
export const getMaterialsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const materials = await Material.find({ room: roomId })
      .sort({ section: 1, createdAt: -1 });

    console.log(`Found ${materials.length} materials for room ${roomId}`);
    res.status(200).json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// Create a new material
export const createMaterial = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, description, section, fileType, fileUrl, fileName } = req.body;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }

    // Determine the file type based on what's provided
    let materialFileType = 'text';
    let materialFileUrl = '';
    let materialFilePath = '';
    let materialFileName = title.trim();
    let originalFileName = '';

    // Handle both link and PDF
    if (fileUrl && req.file) {
      materialFileType = 'link_and_pdf';
      materialFileUrl = fileUrl;
      // Convert origin URL to CDN URL for faster access
      materialFilePath = req.file.location.replace(
        process.env.DO_SPACES_ENDPOINT,
        process.env.DO_SPACES_CDN_ENDPOINT
      );
      materialFileName = req.file.originalname;
      originalFileName = req.file.originalname;
    }
    // Handle only PDF
    else if (req.file) {
      materialFileType = 'pdf';
      // Convert origin URL to CDN URL for faster access
      materialFilePath = req.file.location.replace(
        process.env.DO_SPACES_ENDPOINT,
        process.env.DO_SPACES_CDN_ENDPOINT
      );
      materialFileName = req.file.originalname;
      originalFileName = req.file.originalname;
    }
    // Handle only link
    else if (fileUrl) {
      materialFileType = 'link';
      materialFileUrl = fileUrl;
    }

    const material = new Material({
      title: title.trim(),
      description: description.trim(),
      section,
      fileType: materialFileType,
      fileUrl: materialFileUrl,
      fileName: materialFileName,
      filePath: materialFilePath,
      originalFileName: originalFileName,
      room: roomId
    });

    const savedMaterial = await material.save();
    console.log("Created material:", savedMaterial);
    res.status(201).json(savedMaterial);
  } catch (error) {
    console.error("Error creating material:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      roomId,
      body: req.body
    });
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// Update a material
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, section, fileUrl, fileName, isExpanded } = req.body;

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Validate required fields if provided
    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (description !== undefined && (!description || !description.trim())) {
      return res.status(400).json({ message: "Description is required" });
    }

    // Update basic fields
    if (title) material.title = title.trim();
    if (description !== undefined) material.description = description.trim();
    if (section) material.section = section;
    if (fileName) material.fileName = fileName;
    if (typeof isExpanded === 'boolean') material.isExpanded = isExpanded;

    // Handle file updates
    let hasLink = false;
    let hasPdf = false;

    // Update link
    if (fileUrl !== undefined) {
      material.fileUrl = fileUrl || "";
      hasLink = !!fileUrl;
    } else {
      hasLink = !!material.fileUrl;
    }

    // Handle PDF upload
    if (req.file) {
      // Convert origin URL to CDN URL for faster access
      material.filePath = req.file.location.replace(
        process.env.DO_SPACES_ENDPOINT,
        process.env.DO_SPACES_CDN_ENDPOINT
      );
      material.fileName = req.file.originalname;
      material.originalFileName = req.file.originalname;
      hasPdf = true;
    } else {
      hasPdf = !!material.filePath;
    }

    // Determine file type based on what's available
    if (hasLink && hasPdf) {
      material.fileType = 'link_and_pdf';
    } else if (hasLink) {
      material.fileType = 'link';
    } else if (hasPdf) {
      material.fileType = 'pdf';
    } else {
      material.fileType = 'text';
    }

    const updatedMaterial = await material.save();
    res.status(200).json(updatedMaterial);
  } catch (error) {
    console.error("Error updating material:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      materialId: id,
      body: req.body
    });
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// Delete a material
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Note: S3 files are not automatically deleted to prevent data loss
    // Consider implementing S3 deletion if needed

    await Material.findByIdAndDelete(id);
    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// Toggle material expansion
export const toggleMaterialExpansion = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    material.isExpanded = !material.isExpanded;
    const updatedMaterial = await material.save();

    res.status(200).json(updatedMaterial);
  } catch (error) {
    console.error("Error toggling material expansion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Download a material PDF
export const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    if ((material.fileType !== 'pdf' && material.fileType !== 'link_and_pdf') || !material.filePath) {
      return res.status(400).json({ message: "Material is not a PDF or file not found" });
    }

    // Return the direct URL instead of redirecting to avoid CORS issues
    res.json({ downloadUrl: material.filePath });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};