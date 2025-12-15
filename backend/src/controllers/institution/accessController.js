import Institution from "../../models/institution.js";
import bcrypt from 'bcryptjs';
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

    // Return superadmin and admins list (omit passwords)
    const admins = (institution.admins || []).map(a => ({ email: a.email, name: a.name, createdAt: a.createdAt }));
    return res.json({ 
      superadmin: { email: institution.superadminEmail },
      admins
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
    let { password } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // default password if not provided
    if (!password) password = '1234';
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

    // Add to institution admins array (store hashed password)
    institutionDoc.admins = institutionDoc.admins || [];
    const hash = await bcrypt.hash(password, 10);
    institutionDoc.admins.push({ email: emailNorm, name: name || '', password: hash });
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

// DELETE /api/institutions/:idOrName/access-control - remove admin by email
export async function removeAdmin(req, res) {
  try {
    const { idOrName } = req.params;
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) return res.status(404).json({ message: 'Institution not found' });

    const requesterEmail = (req.user && req.user.email) || (req.admin && req.admin.email);
    if (!requesterEmail || institution.superadminEmail.toLowerCase() !== requesterEmail.toLowerCase()) {
      return res.status(403).json({ message: 'Only the superadmin can remove admins' });
    }

    // Ensure we have a Mongoose doc
    let institutionDoc = institution;
    if (typeof institution.save !== 'function') {
      institutionDoc = await Institution.findById(institution._id);
      if (!institutionDoc) return res.status(404).json({ message: 'Institution not found' });
    }

    const before = (institutionDoc.admins || []).length;
    institutionDoc.admins = (institutionDoc.admins || []).filter(a => a.email.toLowerCase() !== email.toLowerCase());
    const after = institutionDoc.admins.length;
    if (after === before) return res.status(404).json({ message: 'Admin not found' });

    await institutionDoc.save();
    return res.json({ message: 'Admin removed' });
  } catch (err) {
    console.error('removeAdmin error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
}
