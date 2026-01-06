import { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/Navbar";
import RateLimitedUi from "../../components/RateLimitedUi";
import InstitutionCard from "../../components/InstitutionCard";
import InstitutionAnnouncementsWidget from "../../components/common/InstitutionAnnouncementsWidget";
import ClassRoutine from "../../components/ClassRoutine";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router";
import {
  BookOpen,
  Users,
  Calendar,
  Building,
  FileText,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
const S_Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  usePageTitle("Student Dashboard - Manage Courses & Documents");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomsByInstitution, setRoomsByInstitution] = useState({});
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?._id) return;

      try {
        // Fetch rooms grouped by institution
        const roomsRes = await api.get(`/students/${user._id}/rooms`);
        setRoomsByInstitution(roomsRes.data);

        // Extract all rooms for backwards compatibility (if needed)
        const allRooms = [];
        Object.values(roomsRes.data).forEach((group) => {
          allRooms.push(...group.rooms);
        });
        setRooms(allRooms);

        // Fetch student details with institutions
        const studentRes = await api.get(`/students/${user._id}`);
        if (studentRes.data.institutions) {
          setInstitutions(studentRes.data.institutions);
          
          // Set default institution if not already set
          const savedInstitution = localStorage.getItem('selectedInstitutionId');
          if (savedInstitution) {
            setSelectedInstitution(savedInstitution);
          } else if (studentRes.data.institutions.length > 0) {
            const firstInstId = studentRes.data.institutions[0]._id || studentRes.data.institutions[0];
            setSelectedInstitution(firstInstId);
            localStorage.setItem('selectedInstitutionId', firstInstId);
          }
        }

        setIsRateLimited(false);
      } catch (error) {
        console.error("Error fetching student data");
        if (error.response?.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDocumentRequestSuccess = () => {
    toast.success("Document request submitted successfully!");
  };

  // Show loading spinner if auth is still loading or user data is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="max-w-[95vw] mx-auto px-2 py-4 mt-6 flex items-center justify-center">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-2 text-base-content/70">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      {isRateLimited && <RateLimitedUi />}

      <div className="max-w-7xl mx-auto px-4 py-6 mt-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content mb-2">
            Welcome, {user?.name || "Student"}
          </h1>
        </div>

        {loading && (
          <div className="text-center text-sky-600 py-10">
            Loading your enrolled rooms...
          </div>
        )}

        {!isRateLimited && (
          <>
            {Object.keys(roomsByInstitution).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(roomsByInstitution)
                  .filter(([institutionId]) => !selectedInstitution || institutionId === selectedInstitution)
                  .map(([institutionId, data]) => (
                    <div key={institutionId} className="space-y-6">
                      {/* Institution Header */}
                      <div className="mb-4 sm:mb-6 border-b border-base-300 pb-3 sm:pb-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          {data.institution.logo && (
                            <img
                              src={data.institution.logo}
                              alt={data.institution.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-base-300"
                            />
                          )}
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-base-content flex items-center gap-2">
                              <Building className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                              {data.institution.name}
                            </h2>
                            <p className="text-sm sm:text-base text-base-content/60">
                              {data.rooms.length} room{data.rooms.length !== 1 ? "s" : ""} enrolled
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Enrolled Rooms Section */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-base-content mb-3 sm:mb-4">Enrolled Rooms</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {data.rooms.map((room) => (
                            <Link
                              key={room._id}
                              to={`/student/room/${room._id}/forum`}
                              className="card bg-base-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-base-300 group border-t-4 border-t-primary"
                            >
                              <div className="p-4 sm:p-6">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="text-base sm:text-lg font-semibold text-base-content group-hover:text-primary">
                                    {room.room_name}
                                  </h3>
                                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                                </div>
                                <p className="text-base-content/70 line-clamp-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                                  {room.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-base-content/60">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span className="text-xs">{formatDate(room.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span className="text-xs">Enrolled</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Class Routine Section */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-base-content mb-3 sm:mb-4">My Routine</h3>
                        <ClassRoutine
                          rooms={data.rooms}
                          userType="student"
                          userId={user?._id}
                        />
                      </div>

                      {/* Action Buttons Section */}
                      <div className="card bg-base-100 border border-base-300 p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-base-content mb-3 sm:mb-4">Quick Actions</h3>
                        <InstitutionCard
                          institution={data.institution}
                          onRequestSuccess={handleDocumentRequestSuccess}
                          compact={true}
                        />
                      </div>
                    </div>
                  ))}

                {/* Institution Announcements Widget */}
                <div className="mt-8">
                  <InstitutionAnnouncementsWidget
                    userType="student"
                    userId={user?._id}
                    institutionSlug={institutions[0]?.slug}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center py-20">
                  <BookOpen className="w-20 h-20 text-base-content/40 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-base-content/70 mb-2">
                    No enrolled rooms yet
                  </h3>
                  <p className="text-base-content/60 mb-6">
                    You haven't been enrolled in any rooms yet. Contact your instructor to get started.
                  </p>
                </div>

                {/* Show announcements even if no rooms */}
                {institutions[0]?.slug && (
                  <InstitutionAnnouncementsWidget
                    userType="student"
                    userId={user?._id}
                    institutionSlug={institutions[0].slug}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default S_Dashboard;
