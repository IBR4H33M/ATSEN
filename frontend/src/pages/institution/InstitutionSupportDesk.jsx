import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";
import { 
  ChevronLeft, 
  Filter, 
  Search, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Send,
  Check,
  FileText,
  BarChart3
} from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const InstitutionSupportDesk = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [responseText, setResponseText] = useState({});
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
    search: "",
  });
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  const statusOptions = [
    { value: "", label: "All Statuses", color: "gray" },
    { value: "open", label: "Open", color: "blue" },
    { value: "in_progress", label: "In Progress", color: "yellow" },
    { value: "addressed", label: "Addressed", color: "green" },
    { value: "resolved", label: "Resolved", color: "gray" },
  ];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "Academic Support", label: "Academic Support" },
    { value: "Technical Issues", label: "Technical Issues" },
    { value: "Account Management", label: "Account Management" },
    { value: "Course Registration", label: "Course Registration" },
    { value: "Payment & Billing", label: "Payment & Billing" },
    { value: "General Inquiry", label: "General Inquiry" },
    { value: "Other", label: "Other" },
  ];

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "low", label: "Low", color: "green" },
    { value: "medium", label: "Medium", color: "yellow" },
    { value: "high", label: "High", color: "orange" },
    { value: "urgent", label: "Urgent", color: "red" },
  ];

  useEffect(() => {
    if (!user) return;
    fetchTickets();
    fetchStats();
  }, [user, filters]);

  const fetchTickets = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      });

      const response = await api.get(`/support/institution/tickets?${params}`);
      setTickets(response.data.tickets);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/support/institution/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResponseSubmit = async (ticketId) => {
    const response = responseText[ticketId];
    if (!response?.trim()) {
      toast.error("Please enter a response message");
      return;
    }

    try {
      await api.patch(`/support/tickets/${ticketId}/respond`, {
        message: response,
        respondedBy: user.name || "Support Team",
      });

      toast.success("Response sent successfully");
      setResponseText(prev => ({
        ...prev,
        [ticketId]: "",
      }));
      fetchTickets(pagination.current);
    } catch (error) {
      console.error("Error sending response:", error);
      toast.error("Failed to send response");
    }
  };

  const handleMarkAsAddressed = async (ticketId) => {
    try {
      await api.patch(`/support/tickets/${ticketId}/address`);
      toast.success("Ticket marked as addressed");
      fetchTickets(pagination.current);
      fetchStats();
    } catch (error) {
      console.error("Error marking as addressed:", error);
      toast.error("Failed to mark as addressed");
    }
  };

  const handlePriorityUpdate = async (ticketId, newPriority) => {
    try {
      await api.patch(`/support/tickets/${ticketId}/priority`, {
        priority: newPriority,
      });
      toast.success("Priority updated");
      fetchTickets(pagination.current);
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority");
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "high": return "text-orange-600 bg-orange-100";
      case "urgent": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
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

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-base-200">
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-base-content">Support Desk</h1>
                <p className="text-base-content/70">Manage student support requests</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <BarChart3 className="h-5 w-5 text-base-content/60" />
              <span className="text-sm text-base-content/70">
                {pagination.total} total tickets
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats.statusStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {statusOptions.slice(1).map((status) => {
              const count = stats.statusStats.find(s => s._id === status.value)?.count || 0;
              return (
                <div key={status.value} className="bg-base-100 rounded-lg p-4 shadow-sm border border-base-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-base-content/70">{status.label}</p>
                      <p className="text-2xl font-bold text-base-content">{count}</p>
                    </div>
                    <div className={`p-2 rounded-lg bg-${status.color}-100`}>
                      {getStatusIcon(status.value)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-3 py-1 border border-base-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-base-100 text-base-content"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="px-3 py-1 border border-base-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-base-100 text-base-content"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="px-3 py-1 border border-base-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-base-100 text-base-content"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="h-4 w-4 text-base-content/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 pr-4 py-1 w-full border border-base-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-base-100 text-base-content"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-12 text-center">
              <MessageCircle className="h-16 w-16 text-base-content/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-base-content mb-2">No support tickets</h3>
              <p className="text-base-content/60">
                {Object.values(filters).some(v => v) 
                  ? "No tickets match your current filters."
                  : "There are no support tickets yet."
                }
              </p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket._id} className="bg-base-100 rounded-lg border border-base-300 shadow-sm">
                {/* Ticket Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{ticket.student.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{ticket.category}</span>
                        </div>
                        {ticket.attachments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Paperclip className="h-3 w-3" />
                            <span>{ticket.attachments.length} file(s)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={ticket.priority}
                        onChange={(e) => handlePriorityUpdate(ticket._id, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        {priorityOptions.slice(1).map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setExpandedTicket(
                          expandedTicket === ticket._id ? null : ticket._id
                        )}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                      >
                        {expandedTicket === ticket._id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedTicket === ticket._id && (
                  <div className="p-4 bg-gray-50">
                    {/* Original Message */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Original Message</h4>
                      <div className="bg-white rounded p-3 border">
                        <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                        
                        {ticket.attachments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {ticket.attachments.map((file, index) => (
                                <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                                  <Paperclip className="h-3 w-3" />
                                  <span>{file.originalName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Institution Response */}
                    {ticket.institutionResponse?.message && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Our Response</h4>
                        <div className="bg-blue-50 rounded p-3 border border-blue-200">
                          <p className="text-gray-700 whitespace-pre-wrap">{ticket.institutionResponse.message}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            Responded by {ticket.institutionResponse.respondedBy} on{' '}
                            {formatDate(ticket.institutionResponse.respondedAt)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Response Form */}
                    {ticket.status !== "resolved" && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Send Response</h4>
                        <div className="flex gap-3">
                          <textarea
                            value={responseText[ticket._id] || ""}
                            onChange={(e) => setResponseText(prev => ({
                              ...prev,
                              [ticket._id]: e.target.value,
                            }))}
                            placeholder="Type your response here..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            rows={3}
                          />
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleResponseSubmit(ticket._id)}
                              className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors flex items-center gap-2"
                            >
                              <Send className="h-4 w-4" />
                              Send
                            </button>
                            
                            {ticket.status !== "addressed" && ticket.institutionResponse?.message && (
                              <button
                                onClick={() => handleMarkAsAddressed(ticket._id)}
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                              >
                                <Check className="h-4 w-4" />
                                Mark Addressed
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status Message */}
                    {ticket.status === "addressed" && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-green-700 text-sm">
                          ✓ This ticket has been marked as addressed. Waiting for student confirmation.
                        </p>
                      </div>
                    )}

                    {ticket.status === "resolved" && (
                      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-gray-700 text-sm">
                          ✓ This ticket has been resolved by the student on {formatDate(ticket.resolvedAt)}.
                        </p>
                        {ticket.studentFeedback && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Student feedback: {ticket.studentFeedback.comment}</p>
                            {ticket.studentFeedback.rating && (
                              <p>Rating: {ticket.studentFeedback.rating}/5 stars</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => fetchTickets(i + 1)}
                  className={`px-3 py-1 rounded ${
                    pagination.current === i + 1
                      ? "bg-sky-500 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionSupportDesk;
