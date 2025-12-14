// backend/src/controllers/institution/dashboardController.js

import Room from "../../models/Room.js";
import Student from "../../models/student.js";
import Instructor from "../../models/instructor.js";
import { findInstitutionByIdOrName } from "./utils.js";

export async function getInstitutionDashboard(req, res) {
  try {
    const { idOrName } = req.params;
    if (!idOrName) {
      return res
        .status(400)
        .json({ message: "idOrName parameter is required" });
    }

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const instId = institution._id;

    const [
      totalRooms,
      activeRooms,
      totalStudents,
      activeStudents,
      totalInstructors
    ] = await Promise.all([
      Room.countDocuments({ institution: instId }),
      Room.countDocuments({ institution: instId, active: true }),
      Student.countDocuments({ institutions: instId }),
      Student.countDocuments({ institutions: instId}),
      Instructor.countDocuments({ institutions: instId })
    ]);

    return res.json({
      _id:             institution._id,
      name:            institution.name,
      eiin:            institution.eiin,
      email:           (institution.emails && institution.emails.length > 0) ? institution.emails[0] : null,
      phone:           institution.phone,
      address:         institution.address,
      description:     institution.description,
      slug:            institution.slug,

      totalRooms,
      activeRooms,
      totalStudents,
      activeStudents,
      totalInstructors
    });
  } catch (err) {
    console.error("Get dashboard error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}