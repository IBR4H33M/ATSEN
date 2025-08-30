// controllers/adminController.js

import jwt from "jsonwebtoken";
import slugify from "slugify";
import Admin from "../models/Admin.js";
import Institution from "../models/institution.js";
import PendingInstitute from "../models/PendingInstitute.js";

// POST /api/admin/login
export async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }
    
    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ 
      token, 
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/admin/institutions/pending - Get pending institution requests
export async function getPendingInstitutions(req, res) {
  try {
    const pendingInstitutes = await PendingInstitute.find({ status: 'pending' })
      .select('name eiin email phone address description createdAt')
      .sort({ createdAt: -1 });
    
    res.json(pendingInstitutes);
  } catch (error) {
    console.error("Error fetching pending institutions:", error);
    res.status(500).json({ message: "Failed to fetch pending institutions" });
  }
}

// POST /api/admin/institutions/:id/approve - Approve a pending institution
export async function approveInstitution(req, res) {
  const { id } = req.params;

  try {
    // Find the pending institution
    const pendingInstitute = await PendingInstitute.findById(id);
    if (!pendingInstitute) {
      return res.status(404).json({ message: "Pending institution not found" });
    }

    if (pendingInstitute.status !== 'pending') {
      return res.status(400).json({ message: "Institution has already been processed" });
    }

    // Create the approved institution
    const institutionData = {
      name: pendingInstitute.name,
      eiin: pendingInstitute.eiin,
      email: pendingInstitute.email,
      password: pendingInstitute.password, // Already hashed
      phone: pendingInstitute.phone,
      address: pendingInstitute.address,
      description: pendingInstitute.description,
      active: true
    };

    // Create the institution
    const institution = new Institution(institutionData);
    await institution.save();

    // Update pending institute status
    pendingInstitute.status = 'approved';
    await pendingInstitute.save();

    res.json({ 
      message: "Institution approved successfully",
      institution: {
        id: institution._id,
        name: institution.name,
        eiin: institution.eiin,
        email: institution.email
      }
    });

  } catch (error) {
    console.error("Error approving institution:", error);
    res.status(500).json({ message: "Failed to approve institution" });
  }
}

// POST /api/admin/institutions/:id/reject - Reject a pending institution
export async function rejectInstitution(req, res) {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const pendingInstitute = await PendingInstitute.findById(id);
    if (!pendingInstitute) {
      return res.status(404).json({ message: "Pending institution not found" });
    }

    if (pendingInstitute.status !== 'pending') {
      return res.status(400).json({ message: "Institution has already been processed" });
    }

    // Update status and add admin notes
    pendingInstitute.status = 'rejected';
    pendingInstitute.adminNotes = reason || 'No reason provided';
    await pendingInstitute.save();

    res.json({ 
      message: "Institution rejected successfully",
      institution: {
        id: pendingInstitute._id,
        name: pendingInstitute.name,
        eiin: pendingInstitute.eiin
      }
    });

  } catch (error) {
    console.error("Error rejecting institution:", error);
    res.status(500).json({ message: "Failed to reject institution" });
  }
}

// GET /api/admin/institutions - Get all institutions
export async function getAllInstitutions(req, res) {
  try {
    const institutions = await Institution.find({})
      .select('name eiin email active createdAt')
      .sort({ createdAt: -1 });
    
    res.json(institutions);
  } catch (error) {
    console.error("Error fetching institutions:", error);
    res.status(500).json({ message: "Failed to fetch institutions" });
  }
}