/**
 * Donation Routes
 * Handles food donation CRUD operations
 */

import express from 'express';
import {
  createDonation,
  getDonations,
  getDonation,
  getMyDonations,
  getApprovedRequest,
  updateDonation,
  deleteDonation,
  getNearbyDonations,
} from '../controllers/donationController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { donationValidation, validate } from '../middleware/validation.js';
import { uploadFoodPhoto } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', getDonations);
router.get('/nearby', getNearbyDonations);

// Protected routes (Donors) - MUST come before /:id route
router.get('/user/my', protect, authorize('donor', 'admin'), getMyDonations);

router.post(
  '/',
  protect,
  authorize('donor', 'admin'),
  uploadFoodPhoto.array('foodPhotos', 3),
  donationValidation,
  validate,
  createDonation
);

// Get approved request with confirmation code for donor - MUST come before /:id route
router.get('/:id/approved-request', protect, authorize('donor', 'admin'), getApprovedRequest);

router.put(
  '/:id',
  protect,
  authorize('donor', 'admin'),
  uploadFoodPhoto.array('foodPhotos', 3),
  updateDonation
);

router.delete('/:id', protect, authorize('donor', 'admin', 'superadmin'), deleteDonation);

// Public route for getting single donation (with optional auth to allow donors to see their unapproved donations)
router.get('/:id', optionalAuth, getDonation);

export default router;
