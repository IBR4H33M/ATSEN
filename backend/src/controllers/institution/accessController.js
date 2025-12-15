import Institution from "../../models/institution.js";
import { findInstitutionByIdOrName } from "./utils.js";

// GET /api/institutions/:idOrName/access-control
export async function getAccessControl(req, res) {
  try {
    const { idOrName } = req.params;
    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) return res.status(404).json({ message: "Institution not found" });

    // Ensure we have a Mongoose document (findInstitutionByIdOrName may return a lean object)
    // Ensure we have a Mongoose document (findInstitutionByIdOrName may return a lean object)
    let institutionDoc = institution;
    if (typeof institution.save !== 'function') {
      institutionDoc = await Institution.findById(institution._id);
      if (!institutionDoc) return res.status(404).json({ message: "Institution not found" });
    }

    // Ensure requester is authenticated and is superadmin
    const requesterEmail = (req.user && req.user.email) || (req.admin && req.admin.email);
    if (!requesterEmail || institution.superadminEmail.toLowerCase() !== requesterEmail.toLowerCase()) {
      return res.status(403).json({ message: "Only the superadmin can view access control" });
    }

    // Return superadmin and admins list
    return res.json({ 
      superadmin: { email: institution.superadminEmail },
      admins: institution.admins || [] 
    });
  } catch (err) {
    console.error("getAccessControl error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/institutions/:idOrName/access-control
// Body: { email, name, superadminEmail }
export async function addAdmin(req, res) {
  try {
    const { idOrName } = req.params;
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) return res.status(404).json({ message: "Institution not found" });

    // Ensure we have a Mongoose document (findInstitutionByIdOrName may return a lean object)
    let institutionDoc = institution;
    if (typeof institution.save !== 'function') {
      institutionDoc = await Institution.findById(institution._id);
      if (!institutionDoc) return res.status(404).json({ message: "Institution not found" });
    }

    // Ensure requester is authenticated and is superadmin
    const requesterEmail = (req.user && req.user.email) || (req.admin && req.admin.email);
    if (!requesterEmail || institution.superadminEmail.toLowerCase() !== requesterEmail.toLowerCase()) {
      return res.status(403).json({ message: "Only the superadmin can add admins" });
    }

    const emailNorm = email.toLowerCase().trim();

    // Prevent adding superadmin as regular admin
    if (emailNorm === institution.superadminEmail.toLowerCase()) {
      return res.status(400).json({ message: "Cannot add superadmin as regular admin" });
    }

    // Prevent duplicate
    const alreadyExists = (institutionDoc.admins || []).some(a => a.email.toLowerCase() === emailNorm);
    if (alreadyExists) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    // Add to institution admins array
    institutionDoc.admins = institutionDoc.admins || [];
    institutionDoc.admins.push({ email: emailNorm, name: name || '' });
    try {
      await institutionDoc.save();
    } catch (saveErr) {
      console.error('Error saving institution when adding admin:', saveErr);
      return res.status(500).json({ message: 'Failed to add admin' });
    }

    return res.status(201).json({ message: 'Admin added', admin: { email: emailNorm, name: name || '' } });
  } catch (err) {
    console.error('addAdmin error:', err && err.stack ? err.stack : err);
    console.error('addAdmin error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
}
