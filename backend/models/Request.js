/**
 * Request Model
 * Stores food requests made by receivers
 */

import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  // Receiver who made the request
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Donation being requested
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true,
  },
  // Request message/reason
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters'],
  },
  // Number of servings needed
  servingsNeeded: {
    type: Number,
    min: 1,
  },
  // Request status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
  },
  // Confirmation code for food handover (generated when approved)
  confirmationCode: {
    type: String,
  },
  // QR code data (contains pickup info)
  qrCodeData: {
    type: String,
  },
  // Admin who reviewed the request
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  reviewNotes: {
    type: String,
    trim: true,
  },
  // Completion details
  completedAt: {
    type: Date,
  },
  // Rating flags to track if ratings have been given
  donorRated: {
    type: Boolean,
    default: false,
  },
  receiverRated: {
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

// Compound index to prevent duplicate requests
requestSchema.index({ receiver: 1, donation: 1 }, { unique: true });

// Index for status queries
requestSchema.index({ status: 1 });

// Update timestamp
requestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Request = mongoose.model('Request', requestSchema);

export default Request;
