/**
 * Authentication Routes
 * Handles user registration, login, and profile
 */

import express from 'express';
import {
  register,
  registerReceiver,
  login,
  getMe,
  updateProfile,
  changePassword,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  googleAuth,
  completeProfile,
  updateAvatar,
  requestReverification,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  registerValidation,
  receiverRegisterValidation,
  loginValidation,
  validate,
} from '../middleware/validation.js';
import { uploadDocument, uploadAvatar } from '../config/cloudinary.js';
import { loginRateLimit, passwordResetRateLimit } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post(
  '/register/receiver',
  uploadDocument.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'organizationDoc', maxCount: 1 },
  ]),
  receiverRegisterValidation,
  validate,
  registerReceiver
);
router.post('/login', loginRateLimit, loginValidation, validate, login);

// Email verification routes
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);

// Password reset routes
router.post('/forgot-password', passwordResetRateLimit, forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth route
router.post('/google', googleAuth);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, uploadAvatar.single('avatar'), updateProfile);
router.put('/avatar', protect, uploadAvatar.single('avatar'), updateAvatar);
router.put('/change-password', protect, changePassword);
router.post('/complete-profile', protect, completeProfile);
router.post('/request-reverification', protect, requestReverification);

export default router;
