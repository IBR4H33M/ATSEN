import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import Student from "../src/models/student.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

function isObjectIdLike(value) {
  if (!value) return false;
  if (value instanceof mongoose.Types.ObjectId) return true;
  return mongoose.Types.ObjectId.isValid(String(value));
}

function normalizeEntry(entry, fallbackDate) {
  // Old format: institutions: [ObjectId]
  if (isObjectIdLike(entry)) {
    return {
      institution: new mongoose.Types.ObjectId(String(entry)),
      enrolledAt: fallbackDate,
    };
  }

  // New format: institutions: [{ institution: ObjectId, enrolledAt: Date }]
  if (entry && typeof entry === "object" && isObjectIdLike(entry.institution)) {
    return {
      institution: new mongoose.Types.ObjectId(String(entry.institution)),
      enrolledAt: entry.enrolledAt ? new Date(entry.enrolledAt) : fallbackDate,
    };
  }

  return null;
}

async function run() {
  await connectDB();

  const students = await Student.find({}, "institutions createdAt");

  let scanned = 0;
  let changed = 0;
  let malformedRemoved = 0;
  let oldEntriesConverted = 0;
  let duplicatesRemoved = 0;

  for (const student of students) {
    scanned += 1;

    const source = Array.isArray(student.institutions) ? student.institutions : [];
    const fallbackDate = student.createdAt || new Date();
    const dedupMap = new Map();

    for (const entry of source) {
      const normalized = normalizeEntry(entry, fallbackDate);
      if (!normalized) {
        malformedRemoved += 1;
        continue;
      }

      const key = String(normalized.institution);
      const already = dedupMap.get(key);

      if (!already) {
        dedupMap.set(key, normalized);
      } else {
        // Keep the earliest enrolledAt when duplicates exist.
        const currentDate = new Date(already.enrolledAt || fallbackDate).getTime();
        const nextDate = new Date(normalized.enrolledAt || fallbackDate).getTime();
        if (nextDate < currentDate) {
          dedupMap.set(key, normalized);
        }
        duplicatesRemoved += 1;
      }

      // Count converted old entries (ObjectId primitive or string-like)
      if (isObjectIdLike(entry)) {
        oldEntriesConverted += 1;
      }
    }

    const normalizedInstitutions = Array.from(dedupMap.values());

    const before = JSON.stringify(source);
    const after = JSON.stringify(normalizedInstitutions);
    if (before !== after) {
      student.institutions = normalizedInstitutions;
      await student.save();
      changed += 1;
    }
  }

  console.log("Student institutions migration complete.");
  console.log(
    JSON.stringify(
      {
        scanned,
        changed,
        oldEntriesConverted,
        malformedRemoved,
        duplicatesRemoved,
      },
      null,
      2
    )
  );

  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error("Migration failed:", err);
  try {
    await mongoose.connection.close();
  } catch {
    // no-op
  }
  process.exit(1);
});
