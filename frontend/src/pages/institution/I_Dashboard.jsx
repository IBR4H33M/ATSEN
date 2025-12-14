// frontend/src/pages/institution/I_Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building,
  Users,
  BookOpen,
  UserPlus,
  GraduationCap,
  Plus,
  FileText,
  Settings,
  HelpCircle,
  MessageCircle,
  Megaphone,
} from "lucide-react";
import CreateInstitutionAnnouncement from "../../components/institution/CreateInstitutionAnnouncement";
import InstitutionAnnouncementCard from "../../components/institution/InstitutionAnnouncementCard";
import api from "../../lib/axios";
import { sortInstitutionAnnouncements } from "../../utils/announcementUtils";
import { useAuth } from "../../contexts/AuthContext";

export default function I_Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { idOrName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  useEffect(() => {
    if (!idOrName) return;
    api.get(`/institutions/${encodeURIComponent(idOrName)}/dashboard`)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load institution name:", err);
        setErrMsg("Failed to load dashboard data.");
        setLoading(false);
      });
  }, [idOrName]);

  useEffect(() => {
    if (!idOrName) return;
    fetchAnnouncements();
  }, [idOrName]);

  const fetchAnnouncements = async () => {
    try {
      setAnnouncementsLoading(true);
      const response = await api.get(
        `/institution-announcements/${encodeURIComponent(idOrName)}`
      );

      // Sort announcements using utility function
      const sortedAnnouncements = sortInstitutionAnnouncements([
        ...response.data,
      ]);

      setAnnouncements(sortedAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const handleAnnouncementCreated = (newAnnouncement) => {
    const newAnnouncements = [newAnnouncement, ...announcements];

    // Sort announcements using utility function
    const sortedAnnouncements = sortInstitutionAnnouncements([
      ...newAnnouncements,
    ]);

    setAnnouncements(sortedAnnouncements);
  };

  const handleAnnouncementUpdated = (updatedAnnouncement) => {
    const updatedAnnouncements = announcements.map((ann) =>
      ann._id === updatedAnnouncement._id ? updatedAnnouncement : ann
    );

    // Sort announcements using utility function
    const sortedAnnouncements = sortInstitutionAnnouncements([
      ...updatedAnnouncements,
    ]);

    setAnnouncements(sortedAnnouncements);
  };

  const handleAnnouncementDeleted = (announcementId) => {
    setAnnouncements(announcements.filter((ann) => ann._id !== announcementId));
  };

  // Show loading if auth is still loading
  if (authLoading || loading)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center py-10">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-2 text-base-content/70">Loading dashboard...</p>
        </div>
      </div>
    );
  if (errMsg)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-error py-10">{errMsg}</div>
      </div>
    );
  if (!data)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-base-content/60 py-10">
          No data available
        </div>
      </div>
    );

  // Compute master admin email for access control button
  const masterEmail = (data.admins && data.admins.find(a => a.role === 'master') && data.admins.find(a => a.role === 'master').email)
    || (data.emails && data.emails[0])
    || data.email
    || null;

  return (
    <div className="max-w-7xl mx-auto p-4 mt-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            {data.name} Dashboard
          </h1>
          <p className="text-base-content/70">
            Manage your institution's resources and data
          </p>
        </div>
        {/* Access Control Button (right aligned) */}
        {user?.email && masterEmail && user.email.toLowerCase() === masterEmail.toLowerCase() && (
          <Link
            to={`/${encodeURIComponent(idOrName)}/access-control`}
            className="btn btn-accent flex items-center justify-center px-6 py-3 font-medium group self-start md:self-auto"
          >
            <Settings className="h-5 w-5 mr-2" />
            Manage Access Control
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to={`/${encodeURIComponent(idOrName)}/rooms`}
          className="card bg-base-100 hover:bg-blue-50 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-blue-300 group p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/70 group-hover:text-blue-600">
                Total Rooms
              </p>
              <p className="text-3xl font-bold text-base-content group-hover:text-blue-700">
                {data.totalRooms ?? 0}
              </p>
            </div>
            <BookOpen className="h-12 w-12 text-blue-500 group-hover:text-blue-600" />
          </div>
        </Link>

        <Link
          to={`/${encodeURIComponent(idOrName)}/students`}
          className="card bg-base-100 hover:bg-green-50 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-green-300 group p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/70 group-hover:text-green-600">
                Active Students
              </p>
              <p className="text-3xl font-bold text-base-content group-hover:text-green-700">
                {data.activeStudents ?? 0}
              </p>
            </div>
            <GraduationCap className="h-12 w-12 text-green-500 group-hover:text-green-600" />
          </div>
        </Link>

        <Link
          to={`/${encodeURIComponent(idOrName)}/instructors`}
          className="card bg-base-100 hover:bg-purple-50 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-purple-300 group p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/70 group-hover:text-purple-600">
                Total Instructors
              </p>
              <p className="text-3xl font-bold text-base-content group-hover:text-purple-700">
                {data.totalInstructors ?? 0}
              </p>
            </div>
            <Users className="h-12 w-12 text-purple-500 group-hover:text-purple-600" />
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 border border-base-300 p-6 mb-8">
        <h2 className="text-xl font-semibold text-base-content mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to={`/${encodeURIComponent(idOrName)}/add-room`}
            className="btn btn-primary min-w-[100px]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Room
          </Link>
          <Link
            to={`/${encodeURIComponent(idOrName)}/add-student`}
            className="btn btn-outline min-w-[100px]"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Student
          </Link>
          <Link
            to={`/${encodeURIComponent(idOrName)}/add-instructor`}
            className="btn btn-outline min-w-[100px]"
          >
            <Users className="h-5 w-5 mr-2" />
            Add Instructor
          </Link>
        </div>
      </div>

      {/* Institution Announcements */}
      <div className="card bg-base-100 border border-base-300 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Megaphone className="h-6 w-6 text-[#00A2E8] mr-3" />
            <h2 className="text-xl font-semibold text-base-content">
              Institution Announcements
            </h2>
          </div>
          <Link
            to={`/${idOrName}/announcements`}
            className="btn btn-outline btn-primary hover:btn-primary"
          >
            View All Announcements
          </Link>
        </div>

        {/* Create Announcement Component */}
        <div className="mb-6">
          <CreateInstitutionAnnouncement
            institutionId={idOrName}
            onAnnouncementCreated={handleAnnouncementCreated}
          />
        </div>

        {/* Announcements List */}
        {announcementsLoading ? (
          <div className="text-center py-8">
            <div className="loading loading-spinner loading-md text-primary"></div>
            <p className="text-base-content/60 mt-2">
              Loading announcements...
            </p>
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <InstitutionAnnouncementCard
                key={announcement._id}
                announcement={announcement}
                onUpdate={handleAnnouncementUpdated}
                onDelete={handleAnnouncementDeleted}
                canEdit={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Megaphone className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
            <p className="text-base-content/60">No announcements yet</p>
            <p className="text-sm text-base-content/40">
              Create your first announcement to share important information with
              your students and instructors
            </p>
          </div>
        )}
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Desk */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-yellow-500 mr-3" />
            <h3 className="text-lg font-semibold text-base-content">
              Document Desk
            </h3>
          </div>
          <p className="text-base-content/70 mb-4">
            Manage document requests and institutional paperwork efficiently.
          </p>
          <Link
            to={`/${encodeURIComponent(idOrName)}/document-desk`}
            className="btn btn-warning text-warning-content font-medium"
          >
            View Document Desk
          </Link>
        </div>

        {/* Support Desk */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <div className="flex items-center mb-4">
            <HelpCircle className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-lg font-semibold text-base-content">
              Support Desk
            </h3>
          </div>
          <p className="text-base-content/70 mb-4">
            Handle student support queries and provide assistance efficiently.
          </p>
          <Link
            to={`/${encodeURIComponent(idOrName)}/support-desk`}
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            View Support Desk
          </Link>
        </div>

        {/* Institution Details */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-base-content/60 mr-3" />
              <h3 className="text-lg font-semibold text-base-content">
                Institution Details
              </h3>
            </div>
            <Link
              to={`/${encodeURIComponent(idOrName)}/settings`}
              className="p-2 text-base-content/40 hover:text-base-content/60 hover:bg-base-200 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
          <div className="space-y-3">
            {data.description && (
              <div>
                <p className="text-sm font-medium text-base-content/60">
                  Description
                </p>
                <p className="text-base-content">{data.description}</p>
              </div>
            )}
            {data.address && (
              <div>
                <p className="text-sm font-medium text-base-content/60">
                  Address
                </p>
                <p className="text-base-content">{data.address}</p>
              </div>
            )}
            {data.email && (
              <div>
                <p className="text-sm font-medium text-base-content/60">
                  Email
                </p>
                <p className="text-base-content">{data.email}</p>
              </div>
            )}
            {data.phone && (
              <div>
                <p className="text-sm font-medium text-base-content/60">
                  Phone
                </p>
                <p className="text-base-content">{data.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
