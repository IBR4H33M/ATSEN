import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { User, Mail, Calendar, BookOpen, ChevronLeft, Building2, Layers } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../lib/axios";

const S_Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    api.get(`/students/${user._id}`)
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  const name = profile?.name || user?.name || "Student";
  const email = profile?.email || user?.email || "—";
  const createdAt = profile?.createdAt;
  const institutions = Array.isArray(profile?.institutions)
    ? profile.institutions.filter((i) => i && typeof i === "object")
    : [];
  const totalRooms = Array.isArray(profile?.room) ? profile.room.length : 0;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Back button */}
          <Link
            to="/student/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-6 text-base-content/70 hover:text-base-content rounded-md hover:bg-base-100 border border-base-300 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Profile Header */}
          <div className="bg-base-100 rounded-lg shadow-sm mb-6 border border-base-300">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary text-primary-content rounded-full flex items-center justify-center shrink-0">
                  <span className="text-2xl font-semibold">{name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-base-content">{name}</h1>
                  <p className="text-base-content/60">Student</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Personal Information */}
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-300">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-base-content mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-base-content">Name</p>
                      <p className="text-base-content/70">{name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-base-content">Email</p>
                      <p className="text-base-content/70">{email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-base-content">Account Created</p>
                      <p className="text-base-content/70">{formatDate(createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-300">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-base-content mb-4">Academic Information</h2>
                <div className="space-y-4">

                  <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-base-content">Enrolled Rooms</p>
                      <p className="text-base-content/70">{totalRooms} room{totalRooms !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs text-primary-content font-bold">S</span>
                    </div>
                    <div>
                      <p className="font-medium text-base-content">Student Status</p>
                      <p className="text-base-content/70">Active</p>
                    </div>
                  </div>

                  {/* Institutions */}
                  {institutions.length > 0 && (
                    <div className="pt-2 border-t border-base-300">
                      <p className="font-medium text-base-content mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Institutions
                      </p>
                      <div className="space-y-3">
                        {institutions.map((inst) => (
                          <div
                            key={inst._id}
                            className="rounded-lg border border-base-300 bg-base-200/50 px-4 py-3"
                          >
                            <p className="font-semibold text-base-content">{inst.name}</p>
                            {inst.address && (
                              <p className="text-sm text-base-content/60 mt-0.5">{inst.address}</p>
                            )}
                            {inst.email && (
                              <p className="text-sm text-base-content/60">{inst.email}</p>
                            )}
                            {inst.enrolledAt && (
                              <p className="text-xs text-base-content/50 mt-1">Joined {formatDate(inst.enrolledAt)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 mt-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-base-content mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Link to="/student/dashboard" className="btn btn-primary">
                  <BookOpen className="h-4 w-4" />
                  View My Courses
                </Link>
                <Link to="/student/support-tickets" className="btn btn-outline btn-primary">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default S_Profile;
