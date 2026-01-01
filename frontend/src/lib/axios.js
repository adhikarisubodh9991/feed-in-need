/**
 * Axios Instance Configuration
 * Configured with base URL and interceptors
 */

import axios from 'axios';
import toast from 'react-hot-toast';

// API URL: Use relative path for same-domain deployment
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 429 errors (too many requests)
    if (error.response?.status === 429) {
      toast.error('🚫 Too many requests! Please slow down.', {
        duration: 5000,
        id: 'rate-limit-toast', // Prevent duplicate toasts
      });
    }
    // Handle 401 errors (unauthorized) - only redirect if user has a token (session expired)
    // Don't redirect for login attempts (no token means user is trying to login)
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        // Session expired - clear and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // If no token, let the error propagate to show "Wrong username or password"
    }
    return Promise.reject(error);
  }
);

export default api;
