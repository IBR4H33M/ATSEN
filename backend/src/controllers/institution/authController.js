// backend/src/controllers/institution/authController.js

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import Institution from "../../models/institution.js";
import PendingInstitute from "../../models/PendingInstitute.js";

// Utility to generate an 8‐digit unique loginId
async function generateLoginId() {
  let unique = false;
  let loginId;

  while (!unique) {
    loginId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const exists = await Institution.findOne({ loginId });
    if (!exists) unique = true;
  }

  return loginId;
}

// Ensure slug exists
async function ensureSlug(inst) {
  if (!inst.slug) {
    inst.slug = slugify(inst.name, { lower: true, strict: true });
    await inst.save();
  }
  return inst.slug;
}

// Register a new institution (saves to pending for admin approval)
export async function registerInstitution(req, res) {
  const { name, eiin, email, password, phone, address, description } = req.body;
  if (!name || !eiin || !email || !password) {
    return res.status(400).json({ message: "All required fields must be provided." });
  }

  try {
    // Check if institution already exists (approved) or is pending
    const emailNormalized = email.toLowerCase().trim();
    const existingInstitution = await Institution.findOne({ $or: [{ eiin }, { superadminEmail: emailNormalized }] });
    if (existingInstitution) {
      return res.status(409).json({
        message: "Institution with same EIIN or Email already exists."
      });
    }

    const existingPending = await PendingInstitute.findOne({ $or: [{ eiin }, { superadminEmail: emailNormalized }] });
    if (existingPending) {
      return res.status(409).json({
        message: "Registration request with same EIIN or Email is already pending approval."
      });
    }

    // Create pending institution request
    const pendingInstitute = await PendingInstitute.create({
      name,
      eiin: eiin.toUpperCase().trim(),
      superadminEmail: emailNormalized,
      password, // Will be hashed by the model's pre-save hook
      phone,
      address,
      description
    });

    return res.status(201).json({
      message: "Registration request submitted successfully. Please wait for admin approval.",
      requestId: pendingInstitute._id,
      status: "pending"
    });
  } catch (err) {
    console.error("Register institution error:", err);
    return res.status(500).json({ message: err.message });
  }
}

// Login an existing institution (superadmin or admin)
export async function loginInstitution(req, res) {
  const { email, password } = req.body;

  try {
    const emailNormalized = email.toLowerCase().trim();
    
    // First try superadmin login
    let inst = await Institution.findOne({ superadminEmail: emailNormalized });
    let isSuperadmin = false;
    if (inst) {
      const matches = await bcrypt.compare(password, inst.password);
      if (matches) {
        isSuperadmin = true;
      } else {
        inst = null; // treat as not found for superadmin
      }
    }

    // If not superadmin, try matching an institution admin
    let adminEmail = null;
    if (!inst) {
      const instWithAdmin = await Institution.findOne({ 'admins.email': emailNormalized }).select('+admins.password');
      if (instWithAdmin) {
        const admin = (instWithAdmin.admins || []).find(a => a.email.toLowerCase() === emailNormalized);
        if (admin) {
          const ok = await bcrypt.compare(password, admin.password || '');
          if (ok) {
            inst = instWithAdmin;
            adminEmail = admin.email;
            isSuperadmin = false;
          }
        }
      }
    }

    if (!inst) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const slug = await ensureSlug(inst);
    // Include the email in the token so downstream auth checks can identify the requester
    const tokenPayload = { id: inst._id, role: "institution", email: emailNormalized, isSuperadmin };
    if (adminEmail) tokenPayload.adminEmail = adminEmail;
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.json({
      token,
      institution: { id: inst._id, slug, name: inst.name, isSuperadmin, email: emailNormalized }
    });
  } catch (err) {
    console.error("Login institution error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}