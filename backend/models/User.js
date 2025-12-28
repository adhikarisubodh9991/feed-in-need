/**
 * User Model
 * Handles admin, donors, and receivers with different roles
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: function() {
      // Password not required for Google OAuth users
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default
  },
  phone: {
    type: String,
    required: function() {
      // Phone required only after profile is completed
      return this.isProfileComplete;
    },
    trim: true,
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'donor', 'receiver'],
    default: 'donor',
  },
  // Donor specific fields
  donorType: {
    type: String,
    enum: ['individual', 'hotel', null],
    default: null,
  },
  // Receiver specific fields
  receiverType: {
    type: String,
    enum: ['individual', 'organization', null],
    default: null,
  },
  address: {
    type: String,
    trim: true,
  },
  idProof: {
    type: String, // Cloudinary URL for ID proof (individuals)
  },
  organizationDoc: {
    type: String, // Cloudinary URL for registration document (organizations)
  },
  // Verification status for receivers
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  verifiedAt: {
    type: Date,
  },
  // Rejection reason (set by admin when rejecting)
  rejectionReason: {
    type: String,
    trim: true,
  },
  rejectedAt: {
    type: Date,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Profile photo
  avatar: {
    type: String,
  },
  // Trusted badge (earned after successful donations with good ratings)
  isTrusted: {
    type: Boolean,
    default: false,
  },
  trustedAt: {
    type: Date,
  },
  // Trusted badge given by admin
  trustedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Fields for tracking trusted badge removal
  trustedRemovedAt: {
    type: Date,
  },
  trustedRemovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  trustedRemovalReason: {
    type: String,
    trim: true,
  },
  // Rating statistics
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  // Successful transaction counts (for trusted badge calculation)
  successfulDonations: {
    type: Number,
    default: 0,
  },
  successfulReceives: {
    type: Number,
    default: 0,
  },
  // Hotel-specific fields (for location landmark selection)
  hotelDetails: {
    isRegisteredHotel: {
      type: Boolean,
      default: false,
    },
    hotelName: {
      type: String,
      trim: true,
    },
    osmId: {
      type: String, // OpenStreetMap ID for the hotel
    },
  },
  // Email verification fields
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationCode: {
    type: String,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    select: false,
  },
  // Password reset fields
  passwordResetCode: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  // Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values to not conflict
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update timestamp on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if receiver is verified
userSchema.methods.isVerified = function () {
  return this.role === 'receiver' && this.verificationStatus === 'approved';
};

// Generate 4-digit verification code
userSchema.methods.generateVerificationCode = function () {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  this.emailVerificationCode = code;
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

// Generate password reset code
userSchema.methods.generatePasswordResetCode = function () {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  this.passwordResetCode = code;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

const User = mongoose.model('User', userSchema);

export default User;
