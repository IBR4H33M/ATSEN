// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Home
import Home from "./pages/Home.jsx";

// Admin
import Login from "./pages/admin/Login.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminProtectedRoute from "./pages/admin/ProtectedRoute.jsx";

// Auth
import AuthLogin from "./pages/auth/Login.jsx";
import AuthSignup from "./pages/auth/Signup.jsx";
import StudentSignup from "./pages/auth/StudentSignup.jsx";
import InstructorSignup from "./pages/auth/InstructorSignup.jsx";
import InstitutionRegistration from "./pages/auth/InstitutionRegistration.jsx";

// Institution
import InstitutionLayout from "./pages/institution/InstitutionLayout.jsx";
import I_Dashboard from "./pages/institution/I_Dashboard.jsx";
import InstitutionRooms from "./pages/institution/InstitutionRooms.jsx";
import AddRoom from "./pages/institution/AddRoom.jsx";
import AddInstructor from "./pages/institution/AddInstructor.jsx";
import StudentList from "./pages/institution/StudentList.jsx";
import InstructorList from "./pages/institution/InstructorList.jsx";
import InstitutionSettings from "./pages/institution/InstitutionSettings.jsx";
import AccessControl from "./pages/institution/AccessControl.jsx";
import AddStudent from "./pages/institution/AddStudent";
import EditRoom from "./pages/institution/EditRoom.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Teacher
import T_Dashboard from "./pages/teacher/T_Dashboard.jsx";
import T_Room from "./pages/teacher/T_Room.jsx";
import T_AssignmentDetail from "./pages/teacher/T_AssignmentDetail.jsx";
import T_QuizDetail from "./pages/teacher/T_QuizDetail.jsx";

import S_Dashboard from "./pages/student/S_Dashboard.jsx";
import S_Room from "./pages/student/S_Room.jsx";
import S_Profile from "./pages/student/S_Profile.jsx";
import S_Documents from "./pages/student/S_Documents.jsx";
import S_SupportTickets from "./pages/student/S_SupportTickets.jsx";
import MyProgress from "./pages/MyProgress.jsx";

// Institution Document Management
import DocumentDesk from "./pages/institution/DocumentDesk.jsx";
import InstitutionSupportDesk from "./pages/institution/InstitutionSupportDesk.jsx";
import InstitutionAnnouncementDetail from "./pages/institution/InstitutionAnnouncementDetail.jsx";
import S_AssignmentDetail from "./pages/student/S_AssignmentDetail.jsx";
import S_QuizDetail from "./pages/student/S_QuizDetail.jsx";
import AnnouncementDetail from "./pages/student/AnnouncementDetail.jsx";

import TimelineDemo from "./components/room/TimelineDemo.jsx";
import PostLoginRedirect from "./components/PostLoginRedirect.jsx";
import { useTheme } from "./contexts/ThemeContext.jsx";
import YuvrajForms from "./pages/yuvraj_Forms.jsx";
import HelpDesk from "./pages/HelpDesk.jsx";

export default function App() {
  const { theme } = useTheme();

  return (
    <div data-theme={theme}>
      <PostLoginRedirect>
        <Routes>
          {/* 1. Home page */}
          <Route path="/" element={<Home />} />

          {/* 2. Auth (login/signup) */}
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/signup" element={<AuthSignup />} />
          <Route path="/auth/signup/student" element={<StudentSignup />} />
          <Route
            path="/auth/signup/instructor"
            element={<InstructorSignup />}
          />
          <Route
            path="/auth/institution-register"
            element={<InstitutionRegistration />}
          />

          {/* 3. Legacy redirect for old login path */}
          <Route
            path="/login"
            element={<Navigate to="/auth/login" replace />}
          />

          {/* 4. Admin */}
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            }
          />

          {/* 5. Dynamic Institution Routes */}
          <Route
            path="/:idOrName"
            element={
              <ProtectedRoute requiredRole="institution">
                <InstitutionLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<I_Dashboard />} />
            <Route path="dashboard" element={<I_Dashboard />} />

            {/* Rooms */}
            <Route path="rooms" element={<InstitutionRooms />} />
            <Route path="rooms/:roomId/edit" element={<EditRoom />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="add-instructor" element={<AddInstructor />} />

            {/* People */}
            <Route path="students" element={<StudentList />} />
            <Route path="instructors" element={<InstructorList />} />
            <Route path="add-student" element={<AddStudent />} />

            {/* Settings */}
            <Route path="settings" element={<InstitutionSettings />} />
            <Route path="access-control" element={<AccessControl />} />

            {/* Document Desk */}
            <Route path="document-desk" element={<DocumentDesk />} />

            {/* Support Desk */}
            <Route path="support-desk" element={<InstitutionSupportDesk />} />

                         {/* Forms */}
             <Route path="forms" element={<YuvrajForms hideNavbar={true} />} />
             
                         {/* Help Desk */}
             <Route path="helpdesk" element={<HelpDesk hideNavbar={true} />} />
             
             {/* Announcements */}
             <Route path="announcements" element={<InstitutionAnnouncementDetail />} />
             <Route path="announcements/:announcementId" element={<InstitutionAnnouncementDetail />} />
           </Route>

          {/* 6. Teacher */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute requiredRole="instructor">
                <T_Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/teacher/room/:id/forum" element={<T_Room />} />
          <Route path="/teacher/room/:id/materials" element={<T_Room />} />
          <Route path="/teacher/room/:id/assessment" element={<T_Room />} />
          <Route path="/teacher/room/:id/grades" element={<T_Room />} />
          <Route
            path="/teacher/room/:id/assessment/:assessmentId"
            element={<T_AssignmentDetail />}
          />
          <Route
            path="/teacher/room/:id/quiz/:assessmentId"
            element={<T_QuizDetail />}
          />
          <Route path="/teacher/room/:id/details" element={<T_Room />} />
          <Route path="/teacher/room/:id" element={<T_Room />} />
          
          {/* Teacher Announcement Routes */}
          <Route
            path="/teacher/announcements/:idOrName"
            element={
              <ProtectedRoute requiredRole="instructor">
                <InstitutionAnnouncementDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/announcements/:idOrName/:announcementId"
            element={
              <ProtectedRoute requiredRole="instructor">
                <InstitutionAnnouncementDetail />
              </ProtectedRoute>
            }
          />

                     {/* Student routes */}
           <Route
             path="/student/dashboard"
             element={
               <ProtectedRoute requiredRole="student">
                 <S_Dashboard />
               </ProtectedRoute>
             }
           />
           <Route path="/student/profile" element={<S_Profile />} />
           <Route
             path="/student/documents"
             element={
               <ProtectedRoute requiredRole="student">
                 <S_Documents />
               </ProtectedRoute>
             }
           />
           <Route
             path="/student/support-tickets"
             element={
               <ProtectedRoute requiredRole="student">
                 <S_SupportTickets />
               </ProtectedRoute>
             }
           />
           <Route
             path="/student/announcements/:idOrName"
             element={
               <ProtectedRoute requiredRole="student">
                 <AnnouncementDetail />
               </ProtectedRoute>
             }
           />
           <Route
             path="/student/announcements/:idOrName/:announcementId"
             element={
               <ProtectedRoute requiredRole="student">
                 <AnnouncementDetail />
               </ProtectedRoute>
             }
           />
          <Route path="/student/room/:id/forum" element={<S_Room />} />
          <Route path="/student/room/:id/materials" element={<S_Room />} />
          <Route path="/student/room/:id/assessment" element={<S_Room />} />
          <Route path="/student/room/:id/grades" element={<S_Room />} />
          <Route path="/student/room/:id/standings" element={<S_Room />} />
          <Route path="/student/room/:id/forms" element={<S_Room />} />
          
          <Route path="/student/room/:id/details" element={<S_Room />} />
          <Route
            path="/student/room/:id/assessment/:assessmentId"
            element={<S_AssignmentDetail />}
          />
          <Route
            path="/student/room/:id/quiz/:assessmentId"
            element={<S_QuizDetail />}
          />
          {/* Redirect old URL to new forum URL for backward compatibility */}
          <Route path="/student/room/:id" element={<S_Room />} />

          {/* My Progress Route */}
          <Route
            path="/my-progress"
            element={
              <ProtectedRoute>
                <MyProgress />
              </ProtectedRoute>
            }
          />

          {/* Forms Route for Students - Institution Context */}
          <Route
            path="/student/:idOrName/forms"
            element={
              <ProtectedRoute requiredRole="student">
                <YuvrajForms />
              </ProtectedRoute>
            }
          />
          
          {/* Help Desk Route for Students - Institution Context */}
          <Route
            path="/student/:idOrName/helpdesk"
            element={
              <ProtectedRoute requiredRole="student">
                <HelpDesk />
              </ProtectedRoute>
            }
          />
          
          {/* Global Forms Route for Students (fallback) */}
          <Route
            path="/forms"
            element={
              <ProtectedRoute requiredRole="student">
                <YuvrajForms />
              </ProtectedRoute>
            }
          />
          
          {/* Global Help Desk Route for Students (fallback) */}
          <Route
            path="/helpdesk"
            element={
              <ProtectedRoute requiredRole="student">
                <HelpDesk />
              </ProtectedRoute>
            }
          />

          {/* Demo route for timeline testing */}
          <Route path="/demo/timeline" element={<TimelineDemo />} />

          {/* 8. Catch-all 404 */}
          <Route
            path="*"
            element={<p>Page not found: {window.location.pathname}</p>}
          />
        </Routes>
      </PostLoginRedirect>
    </div>
  );
}
