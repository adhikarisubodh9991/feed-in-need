/**
 * Request Routes
 * Handles food request operations
 */

import express from 'express';
import {
  createRequest,
  getMyRequests,
  getRequest,
  cancelRequest,
  completeRequest,
  completeRequestViaQR,
  completeRequestByCode,
  getPickupQRData,
} from '../controllers/requestController.js';
import { protect, authorize, verifiedReceiver } from '../middleware/auth.js';
import { requestValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication and receiver role (except QR data for donors)
router.use(protect);

// Create request (verified receivers only)
router.post('/', authorize('receiver', 'admin'), verifiedReceiver, requestValidation, validate, createRequest);

// Get my requests
router.get('/my', authorize('receiver', 'admin'), getMyRequests);

// Complete request via QR code
router.put('/complete-qr', authorize('receiver', 'admin'), completeRequestViaQR);

// Complete request via confirmation code only (finds the matching request automatically)
router.put('/complete-by-code', authorize('receiver', 'admin'), completeRequestByCode);

// Get QR code data for pickup (for donors)
router.get('/:id/qr-data', authorize('donor', 'admin'), getPickupQRData);

// Get single request
router.get('/:id', authorize('receiver', 'admin'), getRequest);

// Cancel request
router.delete('/:id', authorize('receiver', 'admin'), cancelRequest);

// Complete request
router.put('/:id/complete', authorize('receiver', 'admin'), completeRequest);

export default router;
