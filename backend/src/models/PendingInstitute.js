// backend/src/models/PendingInstitute.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const pendingInstituteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    eiin: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    // admin emails for the pending registration (usually one)
    emails: {
      type: [String],
      required: true,
      validate: [(val) => Array.isArray(val) && val.length > 0, 'At least one email is required'],
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    // Registration status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    // Any additional documents or verification info
    documents: [{
      type: String, // Could store file paths or URLs
    }],
    // Admin notes
    adminNotes: {
      type: String,
      trim: true
    }
  },
  {
    collection: "pendingInstitutes",
    timestamps: true
  }
);

// Hash password before saving
pendingInstituteSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("PendingInstitute", pendingInstituteSchema);
