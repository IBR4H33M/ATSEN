import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Student from "../models/student.js";

// Register student
export async function registerStudent(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const stud = await Student.create({
      name,
      email,
      password: hashed,
    });

    const token = jwt.sign(
      { id: stud._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res
      .status(201)
      .json({ token, student: { id: stud._id, name: stud.name } });
  } catch (err) {
    console.error("Student register error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Login student
export async function loginStudent(req, res) {
  const { email, password } = req.body;

  try {
    const stud = await Student.findOne({ email });
    if (!stud) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const ok = await bcrypt.compare(password, stud.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: stud._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token, student: { id: stud._id, name: stud.name } });
  } catch (err) {
    console.error("Student login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function getAllStudents(req, res) {
  try {
    // exclude passwords
    const students = await Student.find({}, "-password");
    return res.status(200).json(students);
  } catch (err) {
    console.error("getAllStudents error:", err);
    return res.status(500).json({ message: err.message });
  }
}

// Get student's enrolled rooms grouped by institution
export async function getStudentRooms(req, res) {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate({
        path: "institutions.institution",
        select: "name logo",
      })
      .populate({
        path: "room",
        select: "room_name description createdAt institution sections",
        populate: {
          path: "institution",
          select: "name logo",
        },
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Group rooms by institution
    const roomsByInstitution = {};

    student.institutions.forEach((entry) => {
      // entry.institution is the populated Institution doc
      const institution = entry.institution;
      if (!institution) return;

      const institutionRooms = student.room.filter(
        (room) =>
          room.institution &&
          room.institution._id.toString() === institution._id.toString()
      );

      // Filter sections to only include those where the student is assigned
      const filteredRooms = institutionRooms.map((room) => {
        const studentSections = room.sections.filter(
          (section) =>
            section.students &&
            section.students.some(
              (studentId) => studentId.toString() === student._id.toString()
            )
        );

        return {
          ...room.toObject(),
          sections: studentSections,
        };
      });

      if (filteredRooms.length > 0) {
        // Flatten: expose institution fields directly, add enrolledAt
        roomsByInstitution[institution._id] = {
          institution: { ...institution.toObject(), enrolledAt: entry.enrolledAt },
          rooms: filteredRooms,
        };
      }
    });

    return res.json(roomsByInstitution);
  } catch (err) {
    console.error("getStudentRooms error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Get student details with institutions populated
export async function getStudentById(req, res) {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId, "-password")
      .populate({
        path: "institutions.institution",
        select: "name eiin email address description slug",
      })
      .populate({
        path: "room",
        select: "room_name description createdAt",
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Flatten institutions: expose institution fields directly + enrolledAt
    const result = student.toObject();
    result.institutions = result.institutions
      .filter((entry) => entry.institution)
      .map((entry) => ({ ...entry.institution, enrolledAt: entry.enrolledAt }));

    return res.json(result);
  } catch (err) {
    console.error("getStudentById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
