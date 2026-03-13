import { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle, Truck, Package, AlertTriangle, Download } from "lucide-react";
import Navbar from "../../components/Navbar";
import { getStudentDocuments, updateStudentDocumentStatus, downloadDocument } from "../../services/documentService";
import toast from "react-hot-toast";

const S_Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await getStudentDocuments();
      setDocuments(response.documents);
    } catch (error) {
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReceived = async (documentId) => {
    try {
      await updateStudentDocumentStatus(documentId);
      toast.success("Document marked as received!");
      fetchDocuments(); // Refresh the list
    } catch (error) {
      toast.error(error.message || "Failed to update document status");
    }
  };

  const handleDownloadDocument = async (documentId, filename) => {
    try {
      await downloadDocument(documentId, filename);
      toast.success("Document downloaded successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to download document");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Requested":
        return <Clock className="h-5 w-5 text-gray-500" />;
      case "Received":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "Approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Dispatched":
        return <Truck className="h-5 w-5 text-amber-500" />;
      case "Document Received":
        return <Package className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Requested":
        return "badge badge-ghost";
      case "Received":
        return "badge badge-info";
      case "Approved":
        return "badge badge-success";
      case "Dispatched":
        return "badge badge-warning";
      case "Document Received":
        return "badge badge-success";
      default:
        return "badge badge-ghost";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Standard":
        return "badge badge-ghost";
      case "Priority":
        return "badge badge-warning";
      case "Urgent":
        return "badge badge-error";
      default:
        return "badge badge-ghost";
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === "all") return true;
    if (filter === "pending") return !["Document Received"].includes(doc.status);
    if (filter === "completed") return doc.status === "Document Received";
    if (filter === "urgent") return doc.urgency === "Urgent";
    return true;
  });

  const statCards = [
    {
      key: "all",
      label: "Total Requests",
      count: documents.length,
      icon: <FileText className="h-8 w-8 text-sky-500" />,
    },
    {
      key: "pending",
      label: "Pending",
      count: documents.filter((doc) => !["Document Received"].includes(doc.status)).length,
      icon: <Clock className="h-8 w-8 text-amber-500" />,
    },
    {
      key: "completed",
      label: "Completed",
      count: documents.filter((doc) => doc.status === "Document Received").length,
      icon: <Package className="h-8 w-8 text-green-500" />,
    },
    {
      key: "urgent",
      label: "Urgent",
      count: documents.filter((doc) => doc.urgency === "Urgent").length,
      icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-base-content mb-2">My Document Requests</h1>
            <p className="text-base-content/70">Track your document requests and their status</p>
          </div>

          {/* Stats Cards (also filters) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statCards.map((card) => (
              <button
                key={card.key}
                onClick={() => setFilter(card.key)}
                className={`w-full text-left rounded-lg border p-6 transition-all duration-200 hover:shadow-md ${
                  filter === card.key
                    ? "bg-primary/10 border-primary ring-1 ring-primary/40"
                    : "bg-base-100 border-base-300 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center">
                  {card.icon}
                  <div className="ml-4">
                    <p className="text-sm font-medium text-base-content/70">{card.label}</p>
                    <p className="text-2xl font-bold text-base-content">{card.count}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            {filteredDocuments.length === 0 ? (
              <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-12 text-center">
                <FileText className="h-12 w-12 text-base-content/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-base-content mb-2">No documents found</h3>
                <p className="text-base-content/70">
                  {filter === "all" 
                    ? "You haven't made any document requests yet."
                    : `No ${filter} document requests found.`
                  }
                </p>
              </div>
            ) : (
              filteredDocuments.map(document => (
                <div key={document._id} className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-base-content mr-3">
                          {document.documentType}
                        </h3>
                        <span className={`${getUrgencyColor(document.urgency)} badge-sm font-medium`}>
                          {document.urgency}
                        </span>
                      </div>
                      
                      <p className="text-base-content/70 mb-3">{document.description}</p>
                      
                      <div className="flex items-center text-sm text-base-content/60 mb-3">
                        <span>Institution: {document.institution.name}</span>
                        <span className="mx-2">•</span>
                        <span>Requested on {new Date(document.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center">
                        {getStatusIcon(document.status)}
                        <span className={`ml-2 ${getStatusColor(document.status)} badge-sm font-medium`}>
                          {document.status}
                        </span>
                      </div>
                    </div>

                    <div className="ml-6 flex gap-2">
                      {document.status === "Dispatched" && (
                        <button
                          onClick={() => handleMarkAsReceived(document._id)}
                          className="btn btn-sm btn-success"
                        >
                          Mark as Received
                        </button>
                      )}
                      {document.filePath && (
                        <button
                          onClick={() => handleDownloadDocument(document._id, document.filePath)}
                          className="btn btn-sm btn-info text-info-content flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <div className="flex items-center space-x-4">
                      {["Requested", "Received", "Approved", "Dispatched", "Document Received"].map((status, index) => {
                        const isCompleted = document.statusHistory?.some(h => h.status === status) || 
                                           (status === document.status);
                        const isCurrent = status === document.status;
                        
                        return (
                          <div key={status} className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              isCompleted 
                                ? isCurrent 
                                  ? "bg-primary" 
                                  : "bg-success"
                                : "bg-base-300"
                            }`}></div>
                            <span className={`ml-2 text-xs ${
                              isCompleted ? "text-base-content" : "text-base-content/60"
                            }`}>
                              {status}
                            </span>
                            {index < 4 && <div className="w-8 h-px bg-base-300 ml-2"></div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default S_Documents;
