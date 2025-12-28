/**
 * Auth Context
 * Manages authentication state across the application
 */

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token by fetching current user
          const response = await api.get('/auth/me');
          setUser(response.data.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Helper to fetch full user profile after login/register
  const fetchAndSetUser = async (token) => {
    localStorage.setItem('token', token);
    const response = await api.get('/auth/me');
    const userData = response.data.data;
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  // Register donor (sends verification code)
  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  };

  // Register receiver with documents (sends verification code)
  const registerReceiver = async (formData) => {
    const response = await api.post('/auth/register/receiver', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

  // Verify email with 4-digit code
  const verifyEmail = async (email, code) => {
    const response = await api.post('/auth/verify-email', { email, code });
    if (response.data.token) {
      await fetchAndSetUser(response.data.token);
    }
    return response.data;
  };

  // Resend verification code
  const resendVerificationCode = async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  };

  // Forgot password - send reset code
  const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  };

  // Reset password with code
  const resetPassword = async (email, code, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, code, newPassword });
    return response.data;
  };

  // Login
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await fetchAndSetUser(response.data.token);
    }
    return response.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    const response = await api.put('/auth/me', userData);
    const { data } = response.data;
    
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    
    return response.data;
  };

  // Update avatar
  const updateAvatar = async (formData) => {
    const response = await api.put('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Update user with new avatar
    const updatedUser = { ...user, avatar: response.data.data.avatar };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    return response.data;
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  };

  // Refresh user data from server
  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  };

  // Check if user is superadmin
  const isSuperAdmin = user?.role === 'superadmin';

  // Check if user is admin (includes superadmin)
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Check if user is donor
  const isDonor = user?.role === 'donor';

  // Check if user is receiver
  const isReceiver = user?.role === 'receiver';

  // Check if donor is verified
  const isVerifiedDonor = isDonor && user?.verificationStatus === 'approved';

  // Check if receiver is verified
  const isVerifiedReceiver = isReceiver && user?.verificationStatus === 'approved';

  // Check if user is trusted (has trusted badge)
  const isTrusted = user?.isTrusted === true;

  const value = {
    user,
    loading,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isDonor,
    isReceiver,
    isVerifiedDonor,
    isVerifiedReceiver,
    isTrusted,
    register,
    registerReceiver,
    login,
    logout,
    updateProfile,
    updateAvatar,
    changePassword,
    refreshUser,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
