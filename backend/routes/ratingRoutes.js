/**
 * Rating Routes
 * Handles rating operations for donors and receivers
 */

import express from 'express';
import {
  submitRating,
  getUserRatings,
  canRateRequest,
  getMyRatingStats,
} from '../controllers/ratingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route - view user's ratings
router.get('/user/:userId', getUserRatings);

// Protected routes
router.use(protect);

// Submit a rating
router.post('/', submitRating);

// Check if can rate a request
router.get('/can-rate/:requestId', canRateRequest);

// Get my rating stats
router.get('/my-stats', getMyRatingStats);

export default router;
