import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Navbar from "../../components/Navbar.jsx";
import { 
  ChevronLeft, 
  Calendar, 
  User, 
  Tag, 
  Pin, 
  Clock,
  ChevronRight,
  BookOpen,
  ExternalLink,
  Youtube,
  FileText,
  Globe
} from "lucide-react";
import api from "../../lib/axios.js";
import toast from "react-hot-toast";

export default function AnnouncementDetail() {
  const { user } = useAuth();
  const { idOrName, announcementId } = useParams();
  const navigate = useNavigate();
  
  const [announcements, setAnnouncements] = useState([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

  // Fetch all announcements for the institution
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/institution-announcements/${idOrName}`);
        setAnnouncements(response.data);
        
        // Set the first announcement as current if no specific one is selected
        if (response.data.length > 0) {
          if (announcementId) {
            // If specific announcement ID is in URL, select it
            const foundAnnouncement = response.data.find(a => a._id === announcementId);
            if (foundAnnouncement) {
              setSelectedAnnouncementId(announcementId);
              setCurrentAnnouncement(foundAnnouncement);
            } else {
              // If announcement not found, select first one
              setSelectedAnnouncementId(response.data[0]._id);
              setCurrentAnnouncement(response.data[0]);
            }
          } else {
            // No specific announcement, select first one
            setSelectedAnnouncementId(response.data[0]._id);
            setCurrentAnnouncement(response.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
        toast.error("Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };

    if (idOrName) {
      fetchAnnouncements();
    }
  }, [idOrName, announcementId]);

  // Fetch specific announcement details
  useEffect(() => {
    const fetchAnnouncementDetail = async () => {
      if (!selectedAnnouncementId) return;
      
      try {
        const announcement = announcements.find(a => a._id === selectedAnnouncementId);
        if (announcement) {
          setCurrentAnnouncement(announcement);
        }
      } catch (error) {
        console.error("Error fetching announcement detail:", error);
        toast.error("Failed to load announcement details");
      }
    };

    fetchAnnouncementDetail();
  }, [selectedAnnouncementId, announcements]);

  // Handle announcement selection
  const handleAnnouncementSelect = (announcementId) => {
    setSelectedAnnouncementId(announcementId);
    // Update URL without navigation
    window.history.replaceState(null, '', `/student/announcements/${idOrName}/${announcementId}`);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-base-content/50" />
            <p className="text-base-content/70">No announcements available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-300">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to={`/student/dashboard`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-base-content/70 hover:text-base-content rounded-md hover:bg-base-100 border border-base-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-base-content">
              Institution Announcements
            </h1>
          </div>
          
          
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar - Announcements List */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    All Announcements
                  </h2>
                  
                  <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement._id}
                        onClick={() => handleAnnouncementSelect(announcement._id)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${
                          selectedAnnouncementId === announcement._id
                            ? 'bg-primary/10 border-primary shadow-sm'
                            : 'bg-base-100 border-base-300 hover:bg-base-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {announcement.isPinned && (
                            <Pin className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base-content text-sm line-clamp-2 mb-1">
                              {announcement.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-base-content/60">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(announcement.createdAt)}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-base-content/40 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Full Content */}
          <div className="lg:col-span-3">
            {currentAnnouncement ? (
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  {/* Announcement Header */}
                  <div className="mb-8">
                    <div className="flex items-start gap-3 mb-4">
                      {currentAnnouncement.isPinned && (
                        <Pin className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold text-base-content mb-3 leading-tight">
                          {currentAnnouncement.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Institution</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(currentAnnouncement.createdAt)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(currentAnnouncement.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {currentAnnouncement.tags && currentAnnouncement.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentAnnouncement.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="badge badge-outline badge-sm"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Announcement Content */}
                  <div className="prose prose-lg max-w-none">
                    <div 
                      className="text-base-content leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: currentAnnouncement.content.replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>

                  {/* External Links */}
                  {currentAnnouncement.externalLinks && currentAnnouncement.externalLinks.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-base-content mb-3 flex items-center gap-2">
                        <ExternalLink className="h-5 w-5" />
                        External Links
                      </h3>
                      <div className="grid gap-3">
                        {currentAnnouncement.externalLinks.map((link, index) => (
                          <div key={index} className="card bg-base-100 border border-base-300 hover:border-primary/30 transition-colors">
                            <div className="card-body p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  {link.type === 'youtube' && <Youtube className="h-5 w-5 text-red-500" />}
                                  {link.type === 'document' && <FileText className="h-5 w-5 text-blue-500" />}
                                  {link.type === 'website' && <Globe className="h-5 w-5 text-green-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-base-content mb-1">
                                    {link.title || 'External Link'}
                                  </h4>
                                  <p className="text-sm text-base-content/60 truncate">
                                    {link.url}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-primary"
                                  >
                                    Open
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                   <div className="mt-8 pt-6 border-t border-base-300">
                     <div className="flex items-center justify-between text-sm text-base-content/60">
                       <span>Last updated: {formatDate(currentAnnouncement.updatedAt)}</span>
                     </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-base-content/30" />
                    <p className="text-base-content/50 text-lg">Select an announcement to view details</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
