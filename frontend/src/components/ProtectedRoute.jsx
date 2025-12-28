/**
 * Protected Route Component
 * Restricts access based on authentication and roles
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles = [], requireVerification = false }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loader while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access (superadmin has access to all admin routes)
  if (allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(user?.role) || 
      (user?.role === 'superadmin' && allowedRoles.includes('admin'));
    
    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  // Check receiver verification
  if (requireVerification && user?.role === 'receiver' && user?.verificationStatus !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Pending</h2>
          <p className="text-gray-600 mb-4">
            Your account is currently under review. You'll be able to request food once your 
            account is verified by our admin team.
          </p>
          <p className="text-sm text-gray-500">
            Status: <span className="badge badge-pending">{user?.verificationStatus}</span>
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
