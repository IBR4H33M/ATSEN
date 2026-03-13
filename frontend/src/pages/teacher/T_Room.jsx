// src/pages/teacher/T_Room.jsx

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import api from "../../lib/axios";
import {
  ChevronLeft,
  Loader,
  Info,
  MessageSquare,
  BookOpen,
  Calendar,
  TrendingUp,
  Video, // ← added Video icon
  Users,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import DiscussionForum from "../../components/room/DiscussionForum";
import Materials from "../../components/room/Materials";
import Assessment from "../../components/room/Assessment";
import TeacherGrades from "../../components/room/TeacherGrades";
import CourseTimeline from "../../components/room/CourseTimeline";

const T_Room = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meetingLoading, setMeetingLoading] = useState(false); // ← added meetingLoading
  const [activeTab, setActiveTab] = useState("forum"); // Default to forum
  const [lastActiveTab, setLastActiveTab] = useState("forum"); // Store last active tab before details

  const navigate = useNavigate();
  const location = useLocation();
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
    } else {
      // Store as last active tab if not coming from details
      if (activeTab !== "details") {
        setLastActiveTab("forum");
      }
      setActiveTab("forum");
    }
  }, [location.pathname, activeTab]);

  // Fetch room details
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

  // Meeting creation handler
  const handleMeeting = async () => {
    setMeetingLoading(true);
    try {
      const res = await api.post(`/rooms/${id}/meeting`);
      window.open(res.data.join_url, "_blank");
      toast.success("Meeting started!");
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Could not start meeting");
    } finally {
      setMeetingLoading(false);
    }
  };

  // Handle details button toggle
  const handleDetailsToggle = () => {
    if (activeTab === "details") {
      // If details is currently active, go back to last active tab
      navigate(`/teacher/room/${id}/${lastActiveTab}`);
    } else {
      // If details is not active, show details
      navigate(`/teacher/room/${id}/details`);
    }
  };

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
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <Link to="/teacher/dashboard" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-base-content/70 hover:text-base-content rounded-md hover:bg-base-100 border border-base-300 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Room Info Header with Meeting & Settings */}
              <div className="card bg-base-100 border border-base-300 mb-6">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-base-content">
                        {room.room_name}
                      </h1>
                      <p className="text-base-content/70">{room.description}</p>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      {/* Meeting button first */}
                      <button
                        onClick={handleMeeting}
                        disabled={meetingLoading}
                        className="btn btn-primary btn-sm"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        {meetingLoading ? "Starting…" : "Meeting"}
                      </button>
                      {/* Details button second */}
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
                  to={`/teacher/room/${id}/forum`}
                  className={`tab ${activeTab === "forum" ? "tab-active" : ""}`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussion Forum
                </Link>
                <Link
                  to={`/teacher/room/${id}/materials`}
                  className={`tab ${
                    activeTab === "materials" ? "tab-active" : ""
                  }`}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Materials
                </Link>
                <Link
                  to={`/teacher/room/${id}/assessment`}
                  className={`tab ${
                    activeTab === "assessment" ? "tab-active" : ""
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Assessment
                </Link>
                <Link
                  to={`/teacher/room/${id}/grades`}
                  className={`tab ${
                    activeTab === "grades" ? "tab-active" : ""
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Grades
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

                      {/* My Assigned Sections */}
                      {room.userSections && room.userSections.length > 0 && (
                        <div className="mt-4">
                          <label className="label">
                            <span className="label-text font-medium">
                              My Assigned Sections
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
                        Enrolled Students
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
                            No students enrolled yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "forum" && <DiscussionForum roomId={id} />}
              {activeTab === "materials" && <Materials roomId={id} />}
              {activeTab === "assessment" && (
                <Assessment roomId={id} room={room} />
              )}
              {activeTab === "grades" && <TeacherGrades roomId={id} />}
            </div>

            {/* Timeline Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <CourseTimeline roomId={id} room={room} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default T_Room;
