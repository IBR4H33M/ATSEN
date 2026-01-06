import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User, Trophy, Moon, Sun, BarChart3, Users, MessageSquare, Settings, FileText, MessageCircle, Building2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import api from "../lib/axios.js";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isInstitutionDropdownOpen, setIsInstitutionDropdownOpen] = useState(false);
  const [studentInstitutions, setStudentInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(
    localStorage.getItem('selectedInstitutionId') || ''
  );

  // Fetch institutions for students
  useEffect(() => {
    const fetchInstitutions = async () => {
      if (user?.role === 'student' && user?._id) {
        try {
          const res = await api.get(`/students/${user._id}`);
          if (res.data.institutions && res.data.institutions.length > 0) {
            setStudentInstitutions(res.data.institutions);
            // Set first institution as default if none selected
            if (!selectedInstitution) {
              const firstInstId = res.data.institutions[0]._id || res.data.institutions[0];
              setSelectedInstitution(firstInstId);
              localStorage.setItem('selectedInstitutionId', firstInstId);
            }
          }
        } catch (error) {
          console.error('Error fetching student institutions:', error);
        }
      }
    };
    fetchInstitutions();
  }, [user]);

  // Check for admin user in localStorage - prioritize admin over regular user
  const adminDataStr = localStorage.getItem("adminData");
  const adminData = adminDataStr && adminDataStr !== "undefined" ? JSON.parse(adminDataStr) : null;
  const currentUser = adminData ? { ...adminData, role: "admin" } : user;

  const handleLogout = () => {
    if (adminData) {
      // Admin logout
      localStorage.removeItem("token");
      localStorage.removeItem("adminData");
      navigate("/admin/login");
    } else {
      // Regular user logout
      logout();
      navigate("/auth/login");
    }
    setIsDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!currentUser) return "/";

    switch (currentUser.role) {
      case "admin":
        return "/admin/dashboard";
      case "institution":
        return `/${currentUser.slug}/dashboard`;
      case "instructor":
        return "/teacher/dashboard";
      case "student":
        return "/student/dashboard";
      default:
        return "/";
    }
  };

  const getUserDisplayText = () => {
    if (!currentUser) return "";

    switch (currentUser.role) {
      case "admin":
        return "Admin";
      case "institution":
        return currentUser.name || "Institution";
      case "instructor":
        return "Instructor";
      case "student":
        return "Student";
      default:
        return "";
    }
  };

  const getFormsLink = () => {
    if (!user) return "/forms";

    switch (user.role) {
      case "institution":
        return `/${user.slug}/forms`;
      case "student":
        // For students, try to get institution slug from their institutions array
        if (user.institutions && user.institutions.length > 0) {
          // If institutions array has objects with slug property
          if (typeof user.institutions[0] === 'object' && user.institutions[0].slug) {
            return `/student/${user.institutions[0].slug}/forms`;
          }
          // If institutions array has string IDs, we'll need to fetch the slug
          // For now, use the legacy route
        }
        return "/forms";
      default:
        return "/forms";
    }
  };

  const getHelpDeskLink = () => {
    if (!user) return "/helpdesk";

    switch (user.role) {
      case "institution":
        return `/${user.slug}/helpdesk`;
      case "student":
        // For students, try to get institution slug from their institutions array
        if (user.institutions && user.institutions.length > 0) {
          // If institutions array has objects with slug property
          if (typeof user.institutions[0] === 'object' && user.institutions[0].slug) {
            return `/student/${user.institutions[0].slug}/helpdesk`;
          }
          // If institutions array has string IDs, we'll need to fetch the slug
          // For now, use the legacy route
        }
        return "/helpdesk";
      default:
        return "/helpdesk";
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-neutral border-b border-neutral-content/20 px-6 py-3 shadow-md">
      <div className="flex items-center justify-between w-full">
        {/* Left side - Logo and User Info */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Logo */}
          <Link to="/">
            <img
              src="/Atsenlogo.png"
              alt="ATSEN"
              className="h-6 sm:h-8 w-auto cursor-pointer max-w-[120px] sm:max-w-none"
            />
          </Link>

          {/* Divider and User Info - only show when logged in */}
          {currentUser && (
            <>
              <div className="hidden sm:block text-neutral-content/40 text-xl font-light">|</div>
              <Link
                to={getDashboardLink()}
                className="hidden sm:block text-neutral-content hover:text-primary font-medium transition-colors duration-200"
              >
                {getUserDisplayText()}
              </Link>
              
              {/* Institution Selector for Students */}
              {currentUser.role === "student" && studentInstitutions.length > 0 && (
                <>
                  <div className="text-neutral-content/40 text-xl font-light">|</div>
                  <div className="relative">
                    <button
                      onClick={() => setIsInstitutionDropdownOpen(!isInstitutionDropdownOpen)}
                      className="flex items-center space-x-1 sm:space-x-2 text-neutral-content hover:text-primary transition-colors duration-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-neutral-focus font-medium"
                    >
                      <span className="text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                        {studentInstitutions.find(i => (i._id || i) === selectedInstitution)?.name || 'Select'}
                      </span>
                      <ChevronDown
                        className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 flex-shrink-0 ${
                          isInstitutionDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isInstitutionDropdownOpen && (
                      <div className="absolute left-0 sm:left-auto right-0 mt-2 w-56 sm:w-64 bg-base-100 rounded-lg shadow-xl border border-base-300 py-2 z-50">
                        {studentInstitutions.map((inst) => {
                          const instId = inst._id || inst;
                          const instName = inst.name || 'Institution';
                          const isSelected = instId === selectedInstitution;
                          return (
                            <button
                              key={instId}
                              onClick={() => {
                                setSelectedInstitution(instId);
                                localStorage.setItem('selectedInstitutionId', instId);
                                window.dispatchEvent(new Event('institutionChanged'));
                                setIsInstitutionDropdownOpen(false);
                                window.location.reload();
                              }}
                              className={`w-full text-left px-4 py-3 text-base transition-all duration-200 flex items-center justify-between border-l-4 ${
                                isSelected
                                  ? 'border-l-primary font-semibold text-primary'
                                  : 'border-l-transparent text-base-content hover:bg-blue-50 hover:border-l-blue-600'
                              }`}
                            >
                              <span>{instName}</span>
                              {isSelected && (
                                <span className="text-primary">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Right side - Theme Toggle and User Dropdown or Login/Signup buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-neutral-content hover:text-primary transition-colors duration-200 rounded-md hover:bg-neutral-focus"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {currentUser ? (
            // Logged in user dropdown
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-neutral-content hover:text-primary transition-colors duration-200 p-2 rounded-md hover:bg-neutral-focus"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content font-medium text-sm">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-md shadow-lg border border-base-300 py-1 z-50">
                  <div className="px-4 py-2 text-sm text-base-content/60 border-b border-base-300">
                    {currentUser.email || "User Account"}
                  </div>

                  {/* Profile option for students */}
                  {currentUser.role === "student" && (
                    <>
                      <Link
                        to="/student/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 flex items-center space-x-2"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/my-progress"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 flex items-center space-x-2"
                      >
                        <Trophy className="h-4 w-4" />
                        <span>My Progress</span>
                      </Link>

                      <Link
                        to="/student/documents"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 flex items-center space-x-2"
                      >
                        <FileText className="h-4 w-4" />
                        <span>My Documents</span>
                      </Link>

                      <Link
                        to="/student/support-tickets"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 flex items-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>My Support Tickets</span>
                      </Link>
                    </>
                  )}

                  {/* Account Settings for all users */}
                  <Link
                    to={currentUser.role === "admin" ? "/admin/settings" : currentUser.role === "institution" ? `/${currentUser.slug}/settings` : currentUser.role === "instructor" ? "/teacher/settings" : "/student/settings"}
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>

                  {/* Forms link for institutions and students only - not for admin */}
                  {currentUser.role !== "admin" && currentUser.role !== "instructor" && (
                    <>
                      <Link
                        to={getFormsLink()}
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Forms</span>
                      </Link>

                      {/* Help Desk link right under Forms */}
                      <Link
                        to={getHelpDeskLink()}
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Help Desk</span>
                      </Link>
                    </>
                  )}



                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not logged in - show login/signup buttons
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                to="/auth/login"
                className="text-neutral-content hover:text-primary font-medium transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/auth/signup"
                className="bg-primary hover:bg-primary/90 text-primary-content px-4 py-2 rounded-md font-medium transition-colors duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
        {/* End of flex container */}

        {/* Click outside to close dropdowns */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
        {isInstitutionDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsInstitutionDropdownOpen(false)}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
