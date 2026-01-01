/**
 * Main Application Component
 * Sets up routing, authentication provider, and global components
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReceiverRegisterPage from './pages/ReceiverRegisterPage';
import DonationsPage from './pages/DonationsPage';
import DonationDetailPage from './pages/DonationDetailPage';

// Auth Pages
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Donor Pages
import DonatePage from './pages/DonatePage';
import MyDonationsPage from './pages/MyDonationsPage';
import EditDonationPage from './pages/EditDonationPage';

// Receiver Pages
import MyRequestsPage from './pages/MyRequestsPage';
import ConfirmPickupPage from './pages/ConfirmPickupPage';

// User Pages
import ProfilePage from './pages/ProfilePage';
import InboxPage from './pages/InboxPage';
import CertificatePage from './pages/CertificatePage';
import MyCertificatesPage from './pages/MyCertificatesPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReceivers from './pages/admin/AdminReceivers';
import AdminDonors from './pages/admin/AdminDonors';
import AdminRequests from './pages/admin/AdminRequests';
import AdminDonations from './pages/admin/AdminDonations';
import AdminUsers from './pages/admin/AdminUsers';
import AdminManagement from './pages/admin/AdminManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
          <div className="flex flex-col min-h-screen">
            {/* Global Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register/receiver" element={<ReceiverRegisterPage />} />
                <Route path="/donations" element={<DonationsPage />} />
                <Route path="/donations/:id" element={<DonationDetailPage />} />

                {/* Auth Routes */}
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Donor Routes */}
                <Route
                  path="/donate"
                  element={
                    <ProtectedRoute allowedRoles={['donor', 'admin']}>
                      <DonatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-donations"
                  element={
                    <ProtectedRoute allowedRoles={['donor', 'admin']}>
                      <MyDonationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donations/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={['donor', 'admin']}>
                      <EditDonationPage />
                    </ProtectedRoute>
                  }
                />

                {/* Receiver Routes */}
                <Route
                  path="/my-requests"
                  element={
                    <ProtectedRoute allowedRoles={['receiver']}>
                      <MyRequestsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/confirm-pickup"
                  element={
                    <ProtectedRoute allowedRoles={['receiver']}>
                      <ConfirmPickupPage />
                    </ProtectedRoute>
                  }
                />

                {/* User Routes */}
                <Route
                  path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inbox"
                element={
                  <ProtectedRoute>
                    <InboxPage />
                  </ProtectedRoute>
                }
              />
              {/* Certificate Routes - Public view */}
              <Route path="/certificate/:certificateId" element={<CertificatePage />} />
              {/* My Certificates - Protected */}
              <Route
                path="/my-certificates"
                element={
                  <ProtectedRoute allowedRoles={['donor', 'admin']}>
                    <MyCertificatesPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/receivers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReceivers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/donors"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDonors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/requests"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/donations"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDonations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage-admins"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <AdminManagement />
                  </ProtectedRoute>
                }
              />

              {/* 404 Page */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-primary-600">404</h1>
                      <p className="text-xl text-gray-600 mt-4">Page not found</p>
                      <a
                        href="/"
                        className="inline-block mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Go Home
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />
        </div>

          {/* Toast Notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#22c55e',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
  );
}

export default App
