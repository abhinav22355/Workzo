import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import WorkerLayout from './layouts/WorkerLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import ServicesPage from './pages/ServicesPage';
import WorkersPage from './pages/WorkersPage';
import WorkerProfilePage from './pages/WorkerProfilePage';
import HowItWorksPage from './pages/HowItWorksPage';
import BecomeWorkerPage from './pages/BecomeWorkerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerBookingsPage from './pages/CustomerBookingsPage';
import CustomerBookingDetailPage from './pages/CustomerBookingDetailPage';
import CustomerProfilePage from './pages/CustomerProfilePage';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerBookingsPage from './pages/worker/WorkerBookingsPage';
import WorkerAvailabilityPage from './pages/worker/WorkerAvailabilityPage';
import WorkerEarningsPage from './pages/worker/WorkerEarningsPage';
import WorkerProfileEditPage from './pages/worker/WorkerProfileEditPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminWorkersPage from './pages/admin/AdminWorkersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <Routes>
              {/* Public & Customer Routes inside MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<WorkersPage />} />
                <Route path="/workers" element={<WorkersPage />} />
                <Route path="/workers/:id" element={<WorkerProfilePage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/become-worker" element={<BecomeWorkerPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Customer Protected Pages */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerBookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings/:id"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'worker', 'admin']}>
                      <CustomerBookingDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <CustomerProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Worker Routes inside WorkerLayout */}
              <Route
                path="/worker"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/worker/dashboard" replace />} />
                <Route path="dashboard" element={<WorkerDashboard />} />
                <Route path="bookings" element={<WorkerBookingsPage />} />
                <Route path="bookings/:id" element={<CustomerBookingDetailPage />} />
                <Route path="availability" element={<WorkerAvailabilityPage />} />
                <Route path="earnings" element={<WorkerEarningsPage />} />
                <Route path="profile" element={<WorkerProfileEditPage />} />
              </Route>

              {/* Admin Routes inside AdminLayout */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="workers" element={<AdminWorkersPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="services" element={<AdminServicesPage />} />
                <Route path="bookings" element={<AdminBookingsPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
