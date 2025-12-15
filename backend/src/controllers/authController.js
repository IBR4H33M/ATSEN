// backend/src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Institution from "../models/institution.js";
import Instructor from "../models/instructor.js";
import Student from "../models/student.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

/**
 * Universal login endpoint - determines role by checking all user types
 */
export const universalLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    let user = null;
    let role = null;
    let userData = null;

    // Check in institutions first (only superadminEmail allowed)
    const emailNormalized = email.toLowerCase().trim();
    const institution = await Institution.findOne({ superadminEmail: emailNormalized });
    if (institution) {
      const isValidPassword = await bcrypt.compare(password, institution.password);
      if (isValidPassword) {
        user = institution;
        role = "institution";
        userData = {
          _id: institution._id,
          name: institution.name,
          email: emailNormalized,
          slug: institution.slug,
          eiin: institution.eiin,
          phone: institution.phone,
          address: institution.address,
          description: institution.description
        };
      }
    }

    // If not found in institutions, check instructors
    if (!user) {
      const instructor = await Instructor.findOne({ email });
      if (instructor) {
        const isValidPassword = await bcrypt.compare(password, instructor.password);
        if (isValidPassword) {
          user = instructor;
          role = "instructor";
          userData = {
            _id: instructor._id,
            name: instructor.name,
            email: instructor.email
          };
        }
      }
    }

    // If not found in instructors, check students
    if (!user) {
      const student = await Student.findOne({ email });
      if (student) {
        const isValidPassword = await bcrypt.compare(password, student.password);
        if (isValidPassword) {
          user = student;
          role = "student";
          userData = {
            _id: student._id,
            name: student.name,
            email: student.email
          };
        }
      }
    }

    // If no user found or password doesn't match
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role,
        email: emailNormalized || user.email 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return response based on role
    const response = {
      token,
      [role]: userData
    };

    res.json(response);

  } catch (error) {
    console.error("Universal login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};
