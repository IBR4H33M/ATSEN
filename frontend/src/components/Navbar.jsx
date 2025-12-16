import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User, Trophy, Moon, Sun, BarChart3, Users, MessageSquare } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Check for admin user in localStorage
  const adminDataStr = localStorage.getItem("adminData");
  const adminData = adminDataStr && adminDataStr !== "undefined" ? JSON.parse(adminDataStr) : null;
  const currentUser = user || (adminData ? { ...adminData, role: "admin" } : null);

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
    <nav className="sticky top-0 z-50 bg-neutral border-b border-neutral-content/20 px-4 py-3 shadow-md">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
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
                    </>
                  )}

                  {/* Forms link for institutions and students only */}
                  {user?.role !== "instructor" && (
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

        {/* Click outside to close dropdown */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
