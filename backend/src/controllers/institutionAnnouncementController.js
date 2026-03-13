import InstitutionAnnouncement from "../models/InstitutionAnnouncement.js";
import Institution from "../models/institution.js";
import { findInstitutionByIdOrName } from "./institution/utils.js";

// Get all announcements for an institution
export const getInstitutionAnnouncements = async (req, res) => {
  try {
    const { idOrName } = req.params;

    // Find the institution
    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const announcements = await InstitutionAnnouncement.find({
      institution: institution._id,
      isActive: true,
    }).populate("author", "name");

    // Sort announcements: pinned first (by updatedAt), then unpinned (by createdAt)
    announcements.sort((a, b) => {
      // First, sort by isPinned (pinned items first)
      if (a.isPinned !== b.isPinned) {
        return b.isPinned - a.isPinned; // true (1) comes before false (0)
      }

      // For pinned items, sort by updatedAt (most recently pinned first)
      if (a.isPinned && b.isPinned) {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }

      // For unpinned items, sort by createdAt (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching institution announcements:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Get announcements for students/instructors based on their institutions
export const getAnnouncementsForUser = async (req, res) => {
  try {
    const { userType, userId } = req.params;

    let userInstitutions = [];

    if (userType === "student") {
      const Student = await import("../models/student.js").then(
        (m) => m.default
      );
      const user = await Student.findById(userId);
      if (user) {
        userInstitutions = user.institutions.map((entry) => entry.institution);
      }
    } else if (userType === "instructor") {
      const Instructor = await import("../models/instructor.js").then(
        (m) => m.default
      );
      const user = await Instructor.findById(userId).populate("institutions");
      if (user) {
        userInstitutions = user.institutions.map((inst) => inst._id);
      }
    }

    const announcements = await InstitutionAnnouncement.find({
      institution: { $in: userInstitutions },
      isActive: true,
    })
      .populate("institution", "name logo")
      .populate("author", "name")
      .limit(10); // Limit to latest 10 announcements

    // Sort announcements: pinned first (by updatedAt), then unpinned (by createdAt)
    announcements.sort((a, b) => {
      // First, sort by isPinned (pinned items first)
      if (a.isPinned !== b.isPinned) {
        return b.isPinned - a.isPinned; // true (1) comes before false (0)
      }

      // For pinned items, sort by updatedAt (most recently pinned first)
      if (a.isPinned && b.isPinned) {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }

      // For unpinned items, sort by createdAt (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching user announcements:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Create a new institution announcement
export const createInstitutionAnnouncement = async (req, res) => {
  try {
    const { idOrName } = req.params;
    const { title, content, tags, isPinned, externalLinks, images } = req.body;

    // Find the institution
    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // Create announcement
    const announcement = new InstitutionAnnouncement({
      title,
      content,
      institution: institution._id,
      author: institution._id, // Institution is the author
      tags: tags || [],
      externalLinks: externalLinks || [],
      images: images || [],
      isPinned: isPinned || false,
    });

    const savedAnnouncement = await announcement.save();

    // Populate author field for response
    await savedAnnouncement.populate("author", "name");

    res.status(201).json(savedAnnouncement);
  } catch (error) {
    console.error("Error creating institution announcement:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Update an institution announcement
export const updateInstitutionAnnouncement = async (req, res) => {
  try {
    const { idOrName, announcementId } = req.params;
    const { title, content, tags, isPinned, externalLinks, images } = req.body;

    // Find the institution
    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const announcement = await InstitutionAnnouncement.findOne({
      _id: announcementId,
      institution: institution._id,
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Update fields
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (tags) announcement.tags = tags;
    if (externalLinks) announcement.externalLinks = externalLinks;
    if (images) announcement.images = images;
    if (typeof isPinned === "boolean") announcement.isPinned = isPinned;

    const updatedAnnouncement = await announcement.save();
    await updatedAnnouncement.populate("author", "name");

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error("Error updating institution announcement:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Delete an institution announcement
export const deleteInstitutionAnnouncement = async (req, res) => {
  try {
    const { idOrName, announcementId } = req.params;

    // Find the institution
    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const announcement = await InstitutionAnnouncement.findOne({
      _id: announcementId,
      institution: institution._id,
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Soft delete by setting isActive to false
    announcement.isActive = false;
    await announcement.save();

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting institution announcement:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Toggle pin status of an institution announcement
export const togglePinInstitutionAnnouncement = async (req, res) => {
  try {
    const { idOrName, announcementId } = req.params;

    // Find the institution
    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const announcement = await InstitutionAnnouncement.findOne({
      _id: announcementId,
      institution: institution._id,
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    announcement.isPinned = !announcement.isPinned;
    const updatedAnnouncement = await announcement.save();
    await updatedAnnouncement.populate("author", "name");

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error("Error toggling pin status:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};
