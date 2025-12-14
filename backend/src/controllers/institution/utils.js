// backend/src/controllers/institution/utils.js

import mongoose from "mongoose";
import Institution from "../../models/institution.js";

// Helper to find institution by slug only (case-insensitive)
export const findInstitutionByIdOrName = async (idOrName) => {
  try {
    const bySlug = await Institution
      .findOne({ slug: new RegExp(`^${idOrName}$`, "i") })
      .lean();
    if (bySlug) {
      return bySlug;
    }
    
    return null;
  } catch (err) {
    console.error("Error in findInstitutionByIdOrName:", err);
    throw err;
  }
};