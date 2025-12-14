// backend/models/Institution.js

import mongoose from "mongoose";
import slugify from "slugify";

const institutionSchema = new mongoose.Schema(
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
    // allow multiple admin/login emails per institution
    emails: {
      type: [String],
      required: true,
      validate: [(val) => Array.isArray(val) && val.length > 0, 'At least one email is required'],
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },

    // human-friendly URL slug
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // legacy or internal ID, if you still need it
    loginId: {
      type: String,
      required: false,
      unique: true,
      trim: true
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
    active: {
      type: Boolean,
      default: true
    },

    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
      }
    ],
    
    // Document requests received by this institution
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentDocument"
      }
    ]
    ,
    // Institution-level admins (institution-specific accounts)
    admins: [
      {
        email: { type: String, required: true, lowercase: true, trim: true },
        name: { type: String, trim: true },
        role: { type: String, enum: ["master", "admin"], default: "admin" },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    collection: "institutions",
    timestamps: true // auto-manages createdAt & updatedAt
  }
);

  // Ensure unique index on each email across institutions
  institutionSchema.index({ emails: 1 }, { unique: true, sparse: true });

// Auto-generate a URL-safe slug from the institution name
institutionSchema.pre("validate", async function () {
  if (!this.isModified("name")) return;

  // base slug
  let raw = slugify(this.name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });

  // ensure uniqueness by appending a counter if needed
  let uniqueSlug = raw;
  let count = 0;
  while (
    await mongoose.models.Institution.exists({ slug: uniqueSlug, _id: { $ne: this._id } })
  ) {
    count += 1;
    uniqueSlug = `${raw}-${count}`;
  }

  this.slug = uniqueSlug;
});

export default mongoose.model("Institution", institutionSchema);