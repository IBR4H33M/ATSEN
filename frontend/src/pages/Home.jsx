// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import Navbar from "../components/Navbar.jsx";
import { usePageTitle } from "../hooks/usePageTitle";

export default function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isDarkMode } = useTheme();
  usePageTitle("Educational Management Platform for Institutions & Students");

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const handleSignup = () => {
    navigate("/auth/signup");
  };

  const handleInstitutionRegister = () => {
    navigate("/auth/institution-register");
  };

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        
        {/* Hero Section */}
        <div className="relative">
          <div className={`w-full h-[70vh] ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`loading loading-spinner loading-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}></div>
              <p className={`mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Loading...</p>
            </div>
          </div>
        </div>

        {/* Temporary Blank Section */}
        <div className="min-h-[50vh] bg-base-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-base-content mb-4">
              Coming Soon
            </h2>
            <p className="text-base-content/70">
              This section will be updated with more content.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative">
        {/* Theme-aware background */}
        <div className={`w-full h-[70vh] ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-6xl w-full mx-auto px-4 flex items-center justify-between">
            {/* Left Section */}
            <div className={user ? "flex-1" : "flex-1 pr-8"}>
              <div className="animate-fade-in-up">
                <h1 className={`text-5xl lg:text-6xl font-bold mb-6 leading-tight ${isDarkMode ? "text-gray-100" : "text-gray-800"}`} style={{fontFamily: 'Consolas, monospace'}}>
                  <span className={`font-extrabold ${isDarkMode ? "text-gray-100" : "text-gray-800"}`} style={{fontFamily: 'Consolas, monospace'}}>
                    Welcome to ATSEN
                  </span>
                </h1>
                <p className={`text-lg mt-4 font-light animate-fade-in-delayed-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  The comprehensive Learning Management System (LMS) for schools, colleges, and universities. Streamline student enrollment, course management, and academic administration.
                </p>
                
                {/* Register Institution Button - Show for non-logged-in users */}
                {!user && (
                  <div className="mt-8 animate-fade-in-delayed-2">
                    <button
                      onClick={handleInstitutionRegister}
                      className="btn btn-primary btn-lg py-4 px-8 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Register Your Institution
                    </button>
                  </div>
                )}
              </div>

              {/* Show additional content for logged-in users */}
              {user && (
                <div className="mt-10 animate-fade-in-delayed-3">
                  <p className={`text-2xl mb-6 font-light ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>
                    Welcome back, <span className="font-semibold">{user.name || "User"}</span>!
                  </p>
                  <button
                    onClick={() => {
                      if (user.role === "student")
                        navigate("/student/dashboard");
                      else if (user.role === "institution")
                        navigate(`/${user.slug}/dashboard`);
                      else if (user.role === "instructor")
                        navigate("/teacher/dashboard");
                    }}
                    className="btn btn-primary btn-lg py-4 px-8 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* What is ATSEN Section */}
      <div className="min-h-[50vh] bg-base-100 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-base-content mb-4">
              What is ATSEN?
            </h2>
            <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
              ATSEN is a comprehensive Student Information System (SIS) and Learning Management System (LMS) for educational institutions, schools, and universities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-base-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-2">Course & Classroom Management</h3>
              <p className="text-base-content/70">
                Create virtual classrooms, organize course materials, manage assignments, and conduct online assessments for effective e-learning.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-base-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-2">Student Information System (SIS)</h3>
              <p className="text-base-content/70">
                Comprehensive student portal and instructor dashboard for managing academic records, enrollment, and educational progress tracking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-base-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-2">Progress Tracking</h3>
              <p className="text-base-content/70">
                Real-time analytics and progress monitoring for students, instructors, and administrators.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6 bg-base-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-2">Communication Hub</h3>
              <p className="text-base-content/70">
                Built-in chat, discussion forums, and announcement systems for seamless collaboration.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-6 bg-base-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-2">Assessment & Grading</h3>
              <p className="text-base-content/70">
                Create quizzes, assignments, and automated grading systems with detailed feedback.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-6 bg-base-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-2">Institution Management</h3>
              <p className="text-base-content/70">
                Complete administrative tools for managing students, instructors, courses, and institutional data.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-lg text-base-content/70 mb-6">
              Ready to modernize your educational institution?
            </p>
            <button
              onClick={() => navigate("/auth/institution-register")}
              className="btn btn-primary btn-lg py-4 px-8 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </div>

      {/* Dev Team Section */}
      <div className={`w-full py-16 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>Meet the ATSEN Dev Team</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Ibraheem */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/ibraheem.gif"
                alt="Ibraheem Ibn Anwar"
                className={`w-32 h-32 rounded-full object-cover border-4 shadow-md mb-4 ${isDarkMode ? "border-gray-600" : "border-white"}`}
              />
              <a
                href="https://github.com/IBR4H33M"
                target="_blank"
                rel="noopener noreferrer"
                className={`mb-3 transition-colors ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}
                aria-label="Ibraheem GitHub"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>Ibraheem Ibn Anwar</h3>
              <ul className={`text-left space-y-1 text-sm list-disc list-inside ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <li>Institution management system</li>
                <li>URL routing</li>
                <li>Access control management</li>
                <li>Super admin management</li>
                <li>Hosting and deployment</li>
                <li>Search engine optimization</li>
              </ul>
            </div>

            {/* Fuad */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/fuad.jpg"
                alt="Fuad Fardin"
                className={`w-32 h-32 rounded-full object-cover border-4 shadow-md mb-4 ${isDarkMode ? "border-gray-600" : "border-white"}`}
              />
              <a
                href="https://github.com/itsmefuad"
                target="_blank"
                rel="noopener noreferrer"
                className={`mb-3 transition-colors ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}
                aria-label="Fuad GitHub"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>Fuad Fardin</h3>
              <ul className={`text-left space-y-1 text-sm list-disc list-inside ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <li>Design and UI</li>
                <li>Class room management</li>
                <li>Classroom dashboard</li>
                <li>Study resource management</li>
                <li>Study timeline</li>
              </ul>
            </div>

            {/* Jishnu */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/jishnu.png"
                alt="Jishnu Kumar Bacchar"
                className={`w-32 h-32 rounded-full object-cover border-4 shadow-md mb-4 ${isDarkMode ? "border-gray-600" : "border-white"}`}
              />
              <a
                href="https://github.com/JishnuB2027"
                target="_blank"
                rel="noopener noreferrer"
                className={`mb-3 transition-colors ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}
                aria-label="Jishnu GitHub"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>Jishnu Kumar Bacchar</h3>
              <ul className={`text-left space-y-1 text-sm list-disc list-inside ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <li>Login and authentication</li>
                <li>In class chat system</li>
                <li>Grading system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
