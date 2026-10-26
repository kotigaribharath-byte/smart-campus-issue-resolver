import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './layouts/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { VerifyEmailPage } from './pages/public/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ReportIssuePage } from './pages/student/ReportIssuePage';
import { MyIssuesPage } from './pages/student/MyIssuesPage';
import { StudentIssueDetailPage } from './pages/student/StudentIssueDetailPage';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AssignedIssuesPage } from './pages/staff/AssignedIssuesPage';
import { StaffIssueDetailPage } from './pages/staff/StaffIssueDetailPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllIssuesPage } from './pages/admin/AllIssuesPage';
import { AdminIssueDetailPage } from './pages/admin/AdminIssueDetailPage';
import { UsersManagementPage } from './pages/admin/UsersManagementPage';
import { TechniciansPage } from './pages/admin/TechniciansPage';
import { DepartmentsPage } from './pages/admin/DepartmentsPage';
import { BuildingsPage } from './pages/admin/BuildingsPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { FeedbackPage } from './pages/admin/FeedbackPage';

// Shared Pages
import { ProfilePage } from './pages/shared/ProfilePage';
import { NotificationsPage } from './pages/shared/NotificationsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              {/* Full-Page Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Other Public Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Main Application Layout */}
              <Route element={<MainLayout />}>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Student Workspace */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/report"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin']}>
                      <ReportIssuePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/my-issues"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin']}>
                      <MyIssuesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/issues/:id"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin']}>
                      <StudentIssueDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Maintenance Staff Workspace */}
                <Route
                  path="/staff/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/assigned-issues"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <AssignedIssuesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/issues/:id"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <StaffIssueDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Management Workspace */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/issues"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AllIssuesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/issues/:id"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminIssueDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/technicians"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <TechniciansPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UsersManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/departments"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DepartmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/buildings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <BuildingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/feedback"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <FeedbackPage />
                    </ProtectedRoute>
                  }
                />

                {/* Shared User Pages */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
