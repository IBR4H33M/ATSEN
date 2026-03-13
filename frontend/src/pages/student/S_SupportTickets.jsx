import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router";
import { 
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building,
  FileText,
  Star,
  ChevronLeft,
  Filter,
  Eye,
  EyeOff,
  ThumbsUp
} from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const S_SupportTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    institution: "",
  });
  const [feedback, setFeedback] = useState({});
  const [showFeedbackForm, setShowFeedbackForm] = useState(null);

  const statusOptions = [
    { value: "", label: "All Statuses", color: "gray" },
    { value: "open", label: "Open", color: "blue" },
    { value: "in_progress", label: "In Progress", color: "yellow" },
    { value: "addressed", label: "Addressed", color: "green" },
    { value: "resolved", label: "Resolved", color: "gray" },
  ];

  useEffect(() => {
    if (!user?._id) return;
    fetchTickets();
  }, [user, filters]);
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      });

      const response = await api.get(`/support/students/${user._id}/tickets?${params}`);
      setTickets(response.data.tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    if (!user?._id) return;
    fetchTickets();
  }, [user, filters, fetchTickets]);



  const handleMarkAsResolved = async (ticketId) => {
    try {
      const feedbackData = feedback[ticketId];
      await api.patch(`/support/tickets/${ticketId}/resolve`, feedbackData);
      toast.success("Ticket marked as resolved");
      setShowFeedbackForm(null);
      setFeedback(prev => ({ ...prev, [ticketId]: {} }));
      fetchTickets();
    } catch (error) {
      console.error("Error resolving ticket:", error);
      toast.error("Failed to resolve ticket");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "addressed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: "badge badge-info",
      in_progress: "badge badge-warning",
      addressed: "badge badge-success",
      resolved: "badge badge-neutral",
    };
    
    return `${statusConfig[status] || "badge badge-ghost"} badge-sm`;
  };

  const getStatusCardClass = (status) => {
    const statusConfig = {
      open: "bg-info/10 border-info/30",
      in_progress: "bg-warning/10 border-warning/30",
      addressed: "bg-success/10 border-success/30",
      resolved: "bg-base-200 border-base-300",
    };

    return statusConfig[status] || "bg-base-200 border-base-300";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "high": return "text-orange-600";
      case "urgent": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const uniqueInstitutions = [...new Set(tickets.map(t => t.institution.name))];

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-base-content/70">Loading support tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/student/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4 text-base-content/70 hover:text-base-content rounded-md hover:bg-base-100 border border-base-300 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-base-content">My Support Tickets</h1>
            <p className="text-base-content/70">Track your support requests and communications</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {statusOptions.slice(1).map((status) => {
            const count = tickets.filter(t => t.status === status.value).length;
            return (
              <div key={status.value} className="bg-base-100 rounded-lg p-4 shadow-sm border border-base-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-base-content/70">{status.label}</p>
                    <p className="text-2xl font-bold text-base-content">{count}</p>
                  </div>
                  <div className={`p-2 rounded-lg border ${getStatusCardClass(status.value)}`}>
                    {getStatusIcon(status.value)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-base-content/60" />
              <span className="text-sm font-medium text-base-content">Filters:</span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="select select-sm bg-base-100 border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.institution}
                onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value }))}
                className="select select-sm bg-base-100 border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Institutions</option>
                {uniqueInstitutions.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-12 text-center">
              <MessageCircle className="h-16 w-16 text-base-content/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-base-content mb-2">No support tickets</h3>
              <p className="text-base-content/60 mb-6">
                {Object.values(filters).some(v => v) 
                  ? "No tickets match your current filters."
                  : "You haven't created any support tickets yet."
                }
              </p>
              <Link
                to="/student/dashboard"
                className="btn btn-primary"
              >
                Go to Institutions
              </Link>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket._id} className="bg-base-100 rounded-lg border border-base-300 shadow-sm">
                {/* Ticket Header */}
                <div className="p-4 border-b border-base-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="font-medium text-base-content">{ticket.subject}</h3>
                        <span className={getStatusBadge(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority} priority
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-base-content/60">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span>{ticket.institution.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{ticket.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ticket.status === "addressed" && (
                        <button
                          onClick={() => setShowFeedbackForm(ticket._id)}
                          className="btn btn-xs btn-success"
                        >
                          Mark Resolved
                        </button>
                      )}
                      
                      <button
                        onClick={() => setExpandedTicket(
                          expandedTicket === ticket._id ? null : ticket._id
                        )}
                        className="p-2 hover:bg-base-200 rounded transition-colors"
                      >
                        {expandedTicket === ticket._id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedTicket === ticket._id && (
                  <div className="p-4 bg-base-200/40">
                    {/* Original Message */}
                    <div className="mb-4">
                      <h4 className="font-medium text-base-content mb-2">Your Message</h4>
                      <div className="bg-base-100 rounded p-3 border border-base-300">
                        <p className="text-base-content/80 whitespace-pre-wrap">{ticket.description}</p>
                      </div>
                    </div>

                    {/* Institution Response */}
                    {ticket.institutionResponse?.message ? (
                      <div className="mb-4">
                        <h4 className="font-medium text-base-content mb-2">Institution Response</h4>
                        <div className="bg-info/10 rounded p-3 border border-info/30">
                          <p className="text-base-content/80 whitespace-pre-wrap">{ticket.institutionResponse.message}</p>
                          <div className="mt-2 text-xs text-base-content/60">
                            Responded by {ticket.institutionResponse.respondedBy} on{' '}
                            {formatDate(ticket.institutionResponse.respondedAt)}
                          </div>
                        </div>
                      </div>
                    ) : ticket.status !== "open" ? (
                      <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded">
                        <p className="text-warning text-sm">
                          Your request is being processed. You'll receive a response soon.
                        </p>
                      </div>
                    ) : null}

                    {/* Status Messages */}
                    {ticket.status === "addressed" && (
                      <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded">
                        <p className="text-success text-sm">
                          ✓ The institution has marked this issue as addressed. 
                          Please review their response and mark as resolved if your issue is fixed.
                        </p>
                      </div>
                    )}

                    {ticket.status === "resolved" && (
                      <div className="mb-4 p-3 bg-base-200 border border-base-300 rounded">
                        <p className="text-base-content/80 text-sm">
                          ✓ This ticket was resolved on {formatDate(ticket.resolvedAt)}.
                        </p>
                        {ticket.studentFeedback && (
                          <div className="mt-2 text-sm text-base-content/70">
                            <p>Your feedback: {ticket.studentFeedback.comment}</p>
                            {ticket.studentFeedback.rating && (
                              <div className="flex items-center mt-1">
                                <span className="mr-1">Rating:</span>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < ticket.studentFeedback.rating 
                                        ? "text-yellow-400 fill-current" 
                                        : "text-base-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feedback Form */}
                    {showFeedbackForm === ticket._id && (
                      <div className="mt-4 p-4 border border-success/30 rounded-lg bg-success/10">
                        <h4 className="font-medium text-base-content mb-3">Mark as Resolved</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-base-content mb-2">
                              Rate your experience (optional)
                            </label>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => setFeedback(prev => ({
                                    ...prev,
                                    [ticket._id]: { ...prev[ticket._id], rating }
                                  }))}
                                  className="p-1 hover:bg-success/20 rounded transition-colors"
                                >
                                  <Star
                                    className={`h-5 w-5 ${
                                      rating <= (feedback[ticket._id]?.rating || 0)
                                        ? "text-yellow-400 fill-current"
                                        : "text-base-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-base-content mb-2">
                              Additional feedback (optional)
                            </label>
                            <textarea
                              value={feedback[ticket._id]?.comment || ""}
                              onChange={(e) => setFeedback(prev => ({
                                ...prev,
                                [ticket._id]: { ...prev[ticket._id], comment: e.target.value }
                              }))}
                              placeholder="How was your support experience?"
                              className="textarea textarea-bordered w-full bg-base-100 border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMarkAsResolved(ticket._id)}
                              className="btn btn-success btn-sm"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              Mark Resolved
                            </button>
                            <button
                              onClick={() => setShowFeedbackForm(null)}
                              className="btn btn-ghost btn-sm text-base-content/70 hover:text-base-content"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default S_SupportTickets;
