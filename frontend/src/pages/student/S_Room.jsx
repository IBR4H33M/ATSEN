import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router";
import {
  ArrowLeft,
  Loader,
  BookOpen,
  Calendar,
  TrendingUp,
  Trophy,
  Info,
  Users,
  FileText,
  MessageSquare,
} from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import StudentDiscussionForum from "../../components/room/StudentDiscussionForum";
import StudentMaterials from "../../components/room/StudentMaterials";
import StudentAssessment from "../../components/room/StudentAssessment";
import StudentGrades from "../../components/room/StudentGrades";
import CourseTimeline from "../../components/room/CourseTimeline";
import RoomStandings from "../../components/room/RoomStandings";
import FormsHub from "../FormsHub";


const S_Room = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("forum"); // Default to forum
  const [lastActiveTab, setLastActiveTab] = useState("forum"); // Store last active tab before details

  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Determine active tab based on URL
  useEffect(() => {
    if (location.pathname.includes("/details")) {
      setActiveTab("details");
    } else if (location.pathname.includes("/materials")) {
      // Store as last active tab if not coming from details
      if (activeTab !== "details") {
        setLastActiveTab("materials");
      }
      setActiveTab("materials");
    } else if (location.pathname.includes("/assessment")) {
      // Store as last active tab if not coming from details
      if (activeTab !== "details") {
        setLastActiveTab("assessment");
      }
      setActiveTab("assessment");
    } else if (location.pathname.includes("/grades")) {
      // Store as last active tab if not coming from details
      if (activeTab !== "details") {
        setLastActiveTab("grades");
      }
      setActiveTab("grades");
    } else if (location.pathname.includes("/standings")) {
      // Store as last active tab if not coming from details
      if (activeTab !== "details") {
        setLastActiveTab("standings");
      }
      setActiveTab("standings");
    } else if (location.pathname.includes("/forms")) {
      // Store as last active tab if not coming from details
      if (activeTab !== "details") {
        setLastActiveTab("forms");
      }
      setActiveTab("forms");

    } else {
      // Store as last active tab if not coming from details
      if (activeTab !== "details") {
        setLastActiveTab("forum");
      }
      setActiveTab("forum");
    }
  }, [location.pathname, activeTab]);

  // Handle details button toggle
  const handleDetailsToggle = () => {
    if (activeTab === "details") {
      // If details is currently active, go back to last active tab
      navigate(`/student/room/${id}/${lastActiveTab}`);
    } else {
      // If details is not active, show details
      navigate(`/student/room/${id}/details`);
    }
  };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}/with-sections`);
        setRoom(res.data);
      } catch (error) {
        console.log("Error in fetching room details", error);
        toast.error("Failed to fetch room details");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <Loader className="animate-spin size-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Back to Dashboard Button - Floating left */}
        <div className="mb-6 flex justify-start">
          <Link to="/student/dashboard" className="btn btn-ghost">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Room Info Header */}
              <div className="card bg-base-100 border border-base-300 mb-6">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-base-content">
                        {room.room_name}
                      </h1>
                      <p className="text-base-content/70 mt-2">
                        {room.description}
                      </p>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      {/* Details button */}
                      <button
                        onClick={handleDetailsToggle}
                        className={`btn btn-sm ${
                          activeTab === "details" ? "btn-primary" : "btn-ghost"
                        }`}
                      >
                        <Info className="h-4 w-4 mr-1" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs tabs-boxed mb-6">
                <Link
                  to={`/student/room/${id}/forum`}
                  className={`tab ${activeTab === "forum" ? "tab-active" : ""}`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussion Forum
                </Link>
                <Link
                  to={`/student/room/${id}/materials`}
                  className={`tab ${
                    activeTab === "materials" ? "tab-active" : ""
                  }`}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Materials
                </Link>
                <Link
                  to={`/student/room/${id}/assessment`}
                  className={`tab ${
                    activeTab === "assessment" ? "tab-active" : ""
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Assessment
                </Link>
                <Link
                  to={`/student/room/${id}/grades`}
                  className={`tab ${
                    activeTab === "grades" ? "tab-active" : ""
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Grades
                </Link>
                <Link
                  to={`/student/room/${id}/standings`}
                  className={`tab ${
                    activeTab === "standings" ? "tab-active" : ""
                  }`}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Standings
                </Link>
                <Link
                  to={`/student/room/${id}/forms`}
                  className={`tab ${
                    activeTab === "forms" ? "tab-active" : ""
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Forms
                </Link>
              </div>

              {/* Tab Content */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Room Information Card */}
                  <div className="card bg-base-100 border border-base-300">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Room Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="label">
                            <span className="label-text font-medium">
                              Room Name
                            </span>
                          </label>
                          <div className="bg-base-200 p-3 rounded-lg">
                            <p className="text-base-content">
                              {room.room_name}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text font-medium">
                              Created Date
                            </span>
                          </label>
                          <div className="bg-base-200 p-3 rounded-lg">
                            <p className="text-base-content">
                              {new Date(room.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="label">
                          <span className="label-text font-medium">
                            Description
                          </span>
                        </label>
                        <div className="bg-base-200 p-3 rounded-lg">
                          <p className="text-base-content whitespace-pre-wrap">
                            {room.description}
                          </p>
                        </div>
                      </div>

                      {/* My Section */}
                      {room.userSections && room.userSections.length > 0 && (
                        <div className="mt-4">
                          <label className="label">
                            <span className="label-text font-medium">
                              My Section
                            </span>
                          </label>
                          <div className="bg-base-200 p-3 rounded-lg">
                            <div className="flex flex-wrap gap-2">
                              {room.userSections.map((sectionNum) => (
                                <span
                                  key={sectionNum}
                                  className="badge badge-primary badge-lg"
                                >
                                  Section {sectionNum}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Students Information Card */}
                  <div className="card bg-base-100 border border-base-300">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Classmates
                        <span className="badge badge-primary ml-2">
                          {room.students?.length || 0}
                        </span>
                      </h3>

                      {room.students && room.students.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {room.students.map((student, index) => (
                            <div
                              key={student._id || index}
                              className="bg-base-200 p-4 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="avatar placeholder">
                                  <div className="bg-primary text-primary-content rounded-full w-10">
                                    <span className="text-sm font-semibold">
                                      {student.name
                                        ? student.name.charAt(0).toUpperCase()
                                        : "S"}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-base-content">
                                    {student.name || "Student"}
                                  </h4>
                                  <p className="text-sm text-base-content/70">
                                    {student.email || "No email"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-base-content/30 mx-auto mb-3" />
                          <p className="text-base-content/70">
                            No other students enrolled yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "forum" && <StudentDiscussionForum roomId={id} />}

              {activeTab === "materials" && <StudentMaterials roomId={id} />}

              {activeTab === "assessment" && (
                <StudentAssessment roomId={id} room={room} />
              )}

              {activeTab === "grades" && <StudentGrades roomId={id} />}

              {activeTab === "standings" && <RoomStandings roomId={id} />}

              {activeTab === "forms" && <FormsHub hideNavbar={true} />}
              

            </div>

            {/* Timeline Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <CourseTimeline roomId={id} room={room} isStudent={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S_Room;
