/**
 * Admin Routes
 * Handles admin-specific operations
 */

import express from 'express';
import {
  getDashboardStats,
  getAllDonations,
  approveDonation,
  getAllReceivers,
  verifyReceiver,
  getAllDonors,
  verifyDonor,
  getAllRequests,
  handleRequest,
  getAllUsers,
  deleteUser,
  getAllAdmins,
  createAdmin,
  deleteAdmin,
  sendMessageToUser,
  getUserById,
  giveTrustedBadge,
  removeTrustedBadge,
} from '../controllers/adminController.js';
import { protect, authorize, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// Donations management
router.get('/donations', getAllDonations);
router.put('/donations/:id/approve', approveDonation);

// Receivers management
router.get('/receivers', getAllReceivers);
router.put('/receivers/:id/verify', verifyReceiver);

// Donors management
router.get('/donors', getAllDonors);
router.put('/donors/:id/verify', verifyDonor);

// Requests management
router.get('/requests', getAllRequests);
router.put('/requests/:id', handleRequest);

// Users management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users/:id/message', sendMessageToUser);
router.put('/users/:id/trust', giveTrustedBadge);
router.delete('/users/:id/trust', removeTrustedBadge);
router.delete('/users/:id', deleteUser);

// Superadmin only - Admin management
router.get('/admins', isSuperAdmin, getAllAdmins);
router.post('/admins', isSuperAdmin, createAdmin);
router.delete('/admins/:id', isSuperAdmin, deleteAdmin);

export default router;
