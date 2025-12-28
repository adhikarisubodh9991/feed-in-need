/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { sendReceiverVerificationRequest, sendEmailVerificationCode, sendPasswordResetCode } from '../config/email.js';

/**
 * @desc    Register new user (donor) - Step 1: Send verification email
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, donorType, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but email not verified, resend code
      if (!existingUser.isEmailVerified) {
        const code = existingUser.generateVerificationCode();
        await existingUser.save();
        await sendEmailVerificationCode(email, existingUser.name, code);
        return res.status(200).json({
          success: true,
          message: 'Verification code resent to your email',
          requiresVerification: true,
          email: email,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user (not verified yet)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: role || 'donor',
      donorType: role === 'donor' ? donorType : null,
      verificationStatus: 'pending',
      isEmailVerified: false,
      isProfileComplete: true, // Regular registration has complete profile
    });

    // Generate and send verification code
    const code = user.generateVerificationCode();
    await user.save();
    await sendEmailVerificationCode(email, name, code);

    res.status(201).json({
      success: true,
      message: 'Verification code sent to your email',
      requiresVerification: true,
      email: email,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email with code
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email }).select('+emailVerificationCode +emailVerificationExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
      });
    }

    if (user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // If receiver, send verification request to admin
    if (user.role === 'receiver') {
      await sendReceiverVerificationRequest(user);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: user.role === 'receiver' 
        ? 'Email verified successfully. Your account is pending admin verification.' 
        : 'Email verified successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        donorType: user.donorType,
        verificationStatus: user.verificationStatus,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend verification code
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
export const resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    const code = user.generateVerificationCode();
    await user.save();
    await sendEmailVerificationCode(email, user.name, code);

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - send reset code
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    // Check if user signed up with Google (no password)
    if (user.googleId && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google Sign-In. Please login with Google.',
      });
    }

    const code = user.generatePasswordResetCode();
    await user.save();
    await sendPasswordResetCode(email, user.name, code);

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password with code
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+passwordResetCode +passwordResetExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.passwordResetCode || user.passwordResetCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset code',
      });
    }

    if (user.passwordResetExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new one.',
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google OAuth - authenticate or register
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = async (req, res, next) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    // Check if user exists with this Google ID or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // User exists
      if (!user.googleId) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (avatar && !user.avatar) {
          user.avatar = avatar;
        }
        await user.save();
      }

      // Generate token
      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          donorType: user.donorType,
          receiverType: user.receiverType,
          verificationStatus: user.verificationStatus,
          avatar: user.avatar,
          isProfileComplete: user.isProfileComplete,
          isEmailVerified: true,
        },
        token,
        isNewUser: false,
        requiresProfileCompletion: !user.isProfileComplete,
      });
    }

    // New user - create account with Google
    user = await User.create({
      googleId,
      email,
      name,
      avatar,
      role: 'donor',
      isEmailVerified: true, // Google emails are pre-verified
      isProfileComplete: false, // Needs to complete profile
      verificationStatus: 'pending',
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created. Please complete your profile.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isProfileComplete: false,
        isEmailVerified: true,
      },
      token,
      isNewUser: true,
      requiresProfileCompletion: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete profile for Google OAuth users
 * @route   POST /api/auth/complete-profile
 * @access  Private
 */
export const completeProfile = async (req, res, next) => {
  try {
    const { phone, address, role, donorType, receiverType } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update profile
    user.phone = phone;
    user.address = address;
    user.role = role || 'donor';
    user.donorType = role === 'donor' ? donorType : null;
    user.receiverType = role === 'receiver' ? receiverType : null;
    user.isProfileComplete = true;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        donorType: user.donorType,
        receiverType: user.receiverType,
        verificationStatus: user.verificationStatus,
        avatar: user.avatar,
        isProfileComplete: user.isProfileComplete,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register new receiver (individual or organization)
 * @route   POST /api/auth/register/receiver
 * @access  Public
 */
export const registerReceiver = async (req, res, next) => {
  try {
    const { name, email, password, phone, receiverType, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but email not verified, resend code
      if (!existingUser.isEmailVerified) {
        const code = existingUser.generateVerificationCode();
        await existingUser.save();
        await sendEmailVerificationCode(email, existingUser.name, code);
        return res.status(200).json({
          success: true,
          message: 'Verification code resent to your email',
          requiresVerification: true,
          email: email,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Get uploaded files
    const idProof = req.files?.idProof?.[0]?.path;
    const organizationDoc = req.files?.organizationDoc?.[0]?.path;

    // Validate required documents based on receiver type
    if (receiverType === 'individual' && !idProof) {
      return res.status(400).json({
        success: false,
        message: 'ID proof is required for individuals',
      });
    }

    if (receiverType === 'organization' && !organizationDoc) {
      return res.status(400).json({
        success: false,
        message: 'Registration document is required for organizations',
      });
    }

    // Create receiver (not verified yet)
    const receiver = await User.create({
      name,
      email,
      password,
      phone,
      role: 'receiver',
      receiverType,
      address,
      idProof,
      organizationDoc,
      verificationStatus: 'pending',
      isEmailVerified: false,
      isProfileComplete: true,
    });

    // Generate and send verification code
    const code = receiver.generateVerificationCode();
    await receiver.save();
    await sendEmailVerificationCode(email, name, code);

    res.status(201).json({
      success: true,
      message: 'Verification code sent to your email',
      requiresVerification: true,
      email: email,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Wrong username or password',
      });
    }

    // Check if user signed up with Google only (no password)
    if (user.googleId && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google Sign-In. Please login with Google.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Wrong username or password',
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Send new verification code
      const code = user.generateVerificationCode();
      await user.save();
      await sendEmailVerificationCode(email, user.name, code);
      
      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new verification code has been sent.',
        requiresVerification: true,
        email: email,
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        donorType: user.donorType,
        receiverType: user.receiverType,
        verificationStatus: user.verificationStatus,
        avatar: user.avatar,
        isProfileComplete: user.isProfileComplete,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Return only public fields, including receiver-specific fields
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        donorType: user.donorType,
        receiverType: user.receiverType,
        idProof: user.idProof,
        organizationDoc: user.organizationDoc,
        verificationStatus: user.verificationStatus,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isProfileComplete: user.isProfileComplete,
        googleId: user.googleId ? true : false, // Just indicate if Google linked
        // Trusted badge fields
        isTrusted: user.isTrusted,
        trustedAt: user.trustedAt,
        averageRating: user.averageRating,
        totalRatings: user.totalRatings,
        successfulDonations: user.successfulDonations,
        successfulReceives: user.successfulReceives,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    
    // Check if avatar file was uploaded
    const avatar = req.file?.path;

    const updateData = { name, phone, address };
    if (avatar) {
      updateData.avatar = avatar;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update avatar only
 * @route   PUT /api/auth/avatar
 * @access  Private
 */
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image',
      });
    }

    const avatar = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request re-verification after profile fix
 * @route   POST /api/auth/request-reverification
 * @access  Private (Receiver/Donor)
 */
export const requestReverification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Only receivers and donors can request re-verification
    if (user.role !== 'receiver' && user.role !== 'donor') {
      return res.status(403).json({
        success: false,
        message: 'Only receivers and donors can request re-verification',
      });
    }

    // Only rejected users can request re-verification
    if (user.verificationStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Your account is already verified',
      });
    }

    // Update status to pending and clear rejection fields
    user.verificationStatus = 'pending';
    user.rejectionReason = undefined;
    user.rejectedAt = undefined;
    user.rejectedBy = undefined;
    user.verifiedAt = undefined;
    await user.save();

    // Send notification to admin about re-verification request
    try {
      if (user.role === 'receiver') {
        await sendReceiverVerificationRequest(user);
      }
      // Donor verification request email can be added here if needed
    } catch (emailError) {
      console.error('Failed to send re-verification email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Re-verification request submitted successfully. An admin will review your profile shortly.',
      data: {
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
