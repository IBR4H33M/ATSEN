import StudentDocument from "../models/StudentDocument.js";
import Student from "../models/student.js";
import Institution from "../models/institution.js";
import fs from "fs";
import path from "path";

// Student Controllers
export const createDocumentRequest = async (req, res) => {
  try {
    const { documentType, description, urgency, institutionId } = req.body;
    const studentId = req.user.id; // From auth middleware

    if (!studentId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    // Verify student exists and is associated with the institution
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if student is associated with this institution
    if (!student.institutions.some((e) => String(e.institution) === String(institutionId))) {
      return res.status(403).json({ 
        message: "You are not authorized to request documents from this institution" 
      });
    }

    // Create new document request
    const documentRequest = new StudentDocument({
      documentType,
      description,
      urgency,
      student: studentId,
      institution: institutionId,
      status: "Requested"
    });

    await documentRequest.save();

    // Update student's documents array
    await Student.findByIdAndUpdate(studentId, {
      $push: { documents: documentRequest._id }
    });

    // Update institution's documents array
    await Institution.findByIdAndUpdate(institutionId, {
      $push: { documents: documentRequest._id }
    });

    // Populate the document request with student and institution details
    const populatedDocument = await StudentDocument.findById(documentRequest._id)
      .populate('student', 'name email')
      .populate('institution', 'name');

    res.status(201).json({
      message: "Document request submitted successfully",
      document: populatedDocument
    });

  } catch (error) {
    console.error("Error creating document request:", error);
    res.status(500).json({ 
      message: "Failed to create document request", 
      error: error.message 
    });
  }
};

export const getStudentDocuments = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const documents = await StudentDocument.find({ student: studentId })
      .populate('institution', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      documents,
      count: documents.length
    });

  } catch (error) {
    console.error("Error fetching student documents:", error);
    res.status(500).json({ 
      message: "Failed to fetch documents", 
      error: error.message 
    });
  }
};

export const updateDocumentStatusByStudent = async (req, res) => {
  try {
    const { documentId } = req.params;
    const studentId = req.user.id;
    
    // Find the document and verify ownership
    const document = await StudentDocument.findOne({
      _id: documentId,
      student: studentId
    });

    if (!document) {
      return res.status(404).json({ message: "Document request not found" });
    }

    // Students can only update status to "Document Received" and only from "Dispatched"
    if (document.status !== "Dispatched") {
      return res.status(400).json({ 
        message: "Document can only be marked as received when it's in dispatched status" 
      });
    }

    document.status = "Document Received";
    document.actualDelivery = new Date();
    await document.save();

    const updatedDocument = await StudentDocument.findById(documentId)
      .populate('institution', 'name email');

    res.status(200).json({
      message: "Document status updated successfully",
      document: updatedDocument
    });

  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({ 
      message: "Failed to update document status", 
      error: error.message 
    });
  }
};

// Institution Controllers
export const getInstitutionDocuments = async (req, res) => {
  try {
    const institutionId = req.user.id; // From auth middleware
    const { status, urgency } = req.query;
    
    let filter = { institution: institutionId };
    
    // Add filters if provided
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;

    const documents = await StudentDocument.find(filter)
      .populate('student', 'name email')
      .sort({ 
        urgency: urgency === "Urgent" ? 1 : -1, // Urgent first if filtering by urgency
        createdAt: -1 
      });

    // Separate urgent documents for highlighting
    const urgentDocuments = documents.filter(doc => doc.urgency === "Urgent");
    const regularDocuments = documents.filter(doc => doc.urgency !== "Urgent");

    res.status(200).json({
      documents,
      urgentDocuments,
      regularDocuments,
      totalCount: documents.length,
      urgentCount: urgentDocuments.length
    });

  } catch (error) {
    console.error("Error fetching institution documents:", error);
    res.status(500).json({ 
      message: "Failed to fetch documents", 
      error: error.message 
    });
  }
};

export const updateDocumentStatusByInstitution = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status, institutionNotes, estimatedDelivery } = req.body;
    const institutionId = req.user.id;
    
    // Find the document and verify ownership
    const document = await StudentDocument.findOne({
      _id: documentId,
      institution: institutionId
    });

    if (!document) {
      return res.status(404).json({ message: "Document request not found" });
    }

    // Validate status transitions (institutions can only update specific statuses)
    const allowedStatuses = ["Received", "Approved", "Dispatched"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Institutions can only update to: Received, Approved, or Dispatched" 
      });
    }

    // Validate status progression
    const statusOrder = ["Requested", "Received", "Approved", "Dispatched", "Document Received"];
    const currentIndex = statusOrder.indexOf(document.status);
    const newIndex = statusOrder.indexOf(status);
    
    if (newIndex <= currentIndex) {
      return res.status(400).json({ 
        message: "Invalid status progression. Status can only move forward." 
      });
    }

    // Update document
    document.status = status;
    if (institutionNotes) document.institutionNotes = institutionNotes;
    if (estimatedDelivery) document.estimatedDelivery = new Date(estimatedDelivery);
    
    await document.save();

    const updatedDocument = await StudentDocument.findById(documentId)
      .populate('student', 'name email');

    res.status(200).json({
      message: "Document status updated successfully",
      document: updatedDocument
    });

  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({ 
      message: "Failed to update document status", 
      error: error.message 
    });
  }
};

export const getDocumentDetails = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role; // Get user role from JWT
    
    let filter = { _id: documentId };
    
    // Add user-specific filter based on role
    if (userRole === 'student') {
      filter.student = userId;
    } else if (userRole === 'institution') {
      filter.institution = userId;
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const document = await StudentDocument.findOne(filter)
      .populate('student', 'name email')
      .populate('institution', 'name email');

    if (!document) {
      return res.status(404).json({ message: "Document request not found" });
    }

    res.status(200).json({ document });

  } catch (error) {
    console.error("Error fetching document details:", error);
    res.status(500).json({ 
      message: "Failed to fetch document details", 
      error: error.message 
    });
  }
};

export const getDocumentStatistics = async (req, res) => {
  try {
    const institutionId = req.user.id;
    
    // Get statistics for the institution
    const stats = await StudentDocument.aggregate([
      { $match: { institution: institutionId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const urgentCount = await StudentDocument.countDocuments({
      institution: institutionId,
      urgency: "Urgent"
    });

    const todayRequests = await StudentDocument.countDocuments({
      institution: institutionId,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    res.status(200).json({
      statusStatistics: stats,
      urgentCount,
      todayRequests,
      totalDocuments: stats.reduce((total, stat) => total + stat.count, 0)
    });

  } catch (error) {
    console.error("Error fetching document statistics:", error);
    res.status(500).json({ 
      message: "Failed to fetch statistics", 
      error: error.message 
    });
  }
};

// Download document file
export const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Find the document and verify access
    let filter = { _id: documentId };
    
    if (userRole === 'student') {
      filter.student = userId;
    } else if (userRole === 'institution') {
      filter.institution = userId;
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const document = await StudentDocument.findOne(filter);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if document has an associated file
    if (!document.filePath) {
      return res.status(404).json({ message: "No file associated with this document" });
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'uploads', 'materials', document.filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Set headers for file download
    const filename = document.filePath.split('/').pop() || 'document.pdf';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({ 
      message: "Failed to download document", 
      error: error.message 
    });
  }
};
