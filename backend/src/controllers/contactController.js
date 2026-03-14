import ContactMessage from "../models/ContactMessage.js";

export async function createContactMessage(req, res) {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email, and message are required",
      });
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedMessage = String(message).trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return res.status(400).json({
        message: "Name, email, and message are required",
      });
    }

    const created = await ContactMessage.create({
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
    });

    return res.status(201).json({
      message: "Your message has been received",
      contactMessage: {
        _id: created._id,
        name: created.name,
        email: created.email,
        message: created.message,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    console.error("createContactMessage error:", error);
    return res.status(500).json({ message: "Failed to submit contact message" });
  }
}

export async function getPublicContactInfo(req, res) {
  return res.json({
    supportEmail: "support@atsen.app",
    devTeamEmails: ["fuad@atsen.app", "ibraheem@atsen.app", "jishnu@atsen.app"],
  });
}
