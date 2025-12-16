// controllers/adminController.js

import jwt from "jsonwebtoken";
import slugify from "slugify";
import Admin from "../models/Admin.js";
import Institution from "../models/institution.js";
import PendingInstitute from "../models/PendingInstitute.js";
import mongoose from "mongoose";
import { Redis } from '@upstash/redis';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs';

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
      .select('name eiin superadminEmail phone address description createdAt')
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
  
  console.log("Approve institution request:", { id, admin: req.admin });

  try {
    // Find the pending institution
    const pendingInstitute = await PendingInstitute.findById(id);
    if (!pendingInstitute) {
      console.log("Pending institution not found:", id);
      return res.status(404).json({ message: "Pending institution not found" });
    }

    console.log("Found pending institution:", pendingInstitute.name);

    if (pendingInstitute.status !== 'pending') {
      console.log("Institution already processed:", pendingInstitute.status);
      return res.status(400).json({ message: "Institution has already been processed" });
    }

    // Create the approved institution
    const institutionData = {
      name: pendingInstitute.name,
      eiin: pendingInstitute.eiin,
      superadminEmail: pendingInstitute.superadminEmail,
      password: pendingInstitute.password, // Already hashed
      phone: pendingInstitute.phone,
      address: pendingInstitute.address,
      description: pendingInstitute.description,
      active: true,
      admins: [],
      // Generate a unique loginId based on name + timestamp
      loginId: slugify(pendingInstitute.name, { 
        lower: true, 
        strict: true 
      }) + '-' + Date.now()
    };

    // Create the institution and save (this will trigger the slug generation)
    const institution = new Institution(institutionData);
    
    console.log("Creating institution with data:", institutionData);
    
    // Validate first to trigger the pre-validate hook for slug generation
    await institution.validate();
    await institution.save();
    
    console.log("Institution created successfully:", institution.slug);

    // Update pending institute status
    pendingInstitute.status = 'approved';
    await pendingInstitute.save();
    
    console.log("Pending institution status updated to approved");

    res.json({ 
      message: "Institution approved successfully",
      institution: {
        id: institution._id,
        name: institution.name,
        eiin: institution.eiin,
        superadminEmail: institution.superadminEmail,
        slug: institution.slug
      }
    });

  } catch (error) {
    console.error("Error approving institution:", error);
    console.error("Error details:", error.message);
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
      .select('name eiin superadminEmail active createdAt')
      .sort({ createdAt: -1 });
    
    res.json(institutions);
  } catch (error) {
    console.error("Error fetching institutions:", error);
    res.status(500).json({ message: "Failed to fetch institutions" });
  }
}

// DELETE /api/admin/institutions/:id - remove approved institution
export async function deleteInstitution(req, res) {
  try {
    const { id } = req.params;

    // require superadmin
    if (!req.admin || req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only root superadmin can delete institutions' });
    }

    const inst = await Institution.findById(id);
    if (!inst) return res.status(404).json({ message: 'Institution not found' });

    // Remove institution document
    await Institution.findByIdAndDelete(id);
    return res.json({ message: 'Institution removed' });
  } catch (err) {
    console.error('deleteInstitution error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/admin/system-status - aggregated system checks
export async function getSystemStatus(req, res) {
  try {
    // Basic DB status
    const conn = mongoose.connection;
    const dbStatus = {
      readyState: conn.readyState,
      host: conn.host,
      name: conn.name,
      port: conn.port,
      isAtlas: conn.host?.includes('mongodb.net'),
      message: conn.readyState === 1 ? 'Connected' : 'Disconnected'
    };

    // Uptime
    const uptime = process.uptime();

    // Redis (Upstash) check
    let redisStatus = { ok: false };
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
        const pong = await redis.ping();
        redisStatus = { ok: !!pong, pong };
      } else {
        redisStatus = { ok: false, message: 'No UPSTASH env configured' };
      }
    } catch (e) {
      redisStatus = { ok: false, error: e.message || e };
    }

    // S3 / DigitalOcean Spaces check
    let storageStatus = { ok: false };
    try {
      if (process.env.DO_SPACES_BUCKET && process.env.DO_SPACES_ENDPOINT && process.env.DO_SPACES_ACCESS_KEY_ID && process.env.DO_SPACES_SECRET_ACCESS_KEY) {
        const s3 = new S3Client({
          endpoint: process.env.DO_SPACES_ENDPOINT,
          region: 'auto',
          credentials: {
            accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID,
            secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY
          }
        });
        const cmd = new ListObjectsV2Command({ Bucket: process.env.DO_SPACES_BUCKET, MaxKeys: 1 });
        await s3.send(cmd);
        storageStatus = { ok: true };
      } else {
        storageStatus = { ok: false, message: 'Spaces not configured' };
      }
    } catch (e) {
      storageStatus = { ok: false, error: e.message || e };
    }

    // Package version (try to read backend package.json)
    let version = null;
    try {
      const p = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url)));
      version = p.version;
    } catch (e) {
      version = null;
    }

    res.json({
      dbStatus,
      redisStatus,
      storageStatus,
      uptime,
      version
    });
  } catch (err) {
    console.error('getSystemStatus error:', err);
    res.status(500).json({ message: 'Failed to run system checks' });
  }
}

// PATCH /api/admin/institutions/:id/active - set active flag
export async function setInstitutionActive(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') return res.status(400).json({ message: 'active (boolean) is required' });

    if (!req.admin || req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only root superadmin can change institution active state' });
    }

    const inst = await Institution.findById(id);
    if (!inst) return res.status(404).json({ message: 'Institution not found' });

    inst.active = active;
    await inst.save();
    return res.json({ message: 'Institution updated', institution: { id: inst._id, active: inst.active } });
  } catch (err) {
    console.error('setInstitutionActive error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}