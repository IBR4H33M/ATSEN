import Institution from "../../models/institution.js";
import Admin from "../../models/Admin.js";
import { findInstitutionByIdOrName } from "./utils.js";

// GET /api/institutions/:idOrName/access-control
export async function getAccessControl(req, res) {
  try {
    const { idOrName } = req.params;
    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) return res.status(404).json({ message: "Institution not found" });

    // Return admins list
    return res.json({ admins: institution.admins || [] });
  } catch (err) {
    console.error("getAccessControl error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/institutions/:idOrName/access-control
// Body: { email, name, role }
export async function addAdmin(req, res) {
  try {
    const { idOrName } = req.params;
    const { email, name, role = 'admin' } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) return res.status(404).json({ message: "Institution not found" });

    // Ensure requester is master admin
    const requesterEmail = (req.user && req.user.email) || (req.admin && req.admin.email);
    const master = (institution.admins || []).find(a => a.role === 'master');
    if (!master || !requesterEmail || master.email.toLowerCase() !== requesterEmail.toLowerCase()) {
      return res.status(403).json({ message: "Only the master admin can manage access control" });
    }

    const emailNorm = email.toLowerCase().trim();

    // Prevent duplicate in institution admin list
    if ((institution.admins || []).some(a => a.email.toLowerCase() === emailNorm)) {
      return res.status(409).json({ message: "Admin with this email already exists for institution" });
    }

    // Create global Admin account if not exists
    let createdAdmin = null;
    const existingGlobal = await Admin.findOne({ email: emailNorm });
    if (!existingGlobal) {
      createdAdmin = await Admin.create({ name: name || emailNorm.split('@')[0], email: emailNorm, password: 'pass1234', role: 'admin' });
    }

    // Add to institution admins
    institution.admins = institution.admins || [];
    institution.admins.push({ email: emailNorm, name: name || '', role });
    await institution.save();

    return res.status(201).json({ message: 'Admin added', admin: { email: emailNorm, name: name || '', role } });
  } catch (err) {
    console.error('addAdmin error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
