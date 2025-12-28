/**
 * Certificate Routes
 * Handles donation certificate and social sharing endpoints
 */

import express from 'express';
import {
  getCertificate,
  getMyCertificates,
  getReceivedCertificates,
  updateCertificateImage,
  getCertificateByDonation,
  getShareUrls,
} from '../controllers/certificateController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/:certificateId/share-urls', getShareUrls);
router.get('/id/:certificateId', getCertificate);

// Protected routes
router.use(protect);

// Get my certificates (donor)
router.get('/my', getMyCertificates);

// Get received certificates (receiver)
router.get('/received', authorize('receiver', 'admin', 'superadmin'), getReceivedCertificates);

// Get certificate by donation ID
router.get('/donation/:donationId', getCertificateByDonation);

// Update certificate image
router.put('/:certificateId/image', updateCertificateImage);

export default router;
