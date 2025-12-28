/**
 * Notification Model
 * Stores user notifications
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'verification_approved',
      'verification_rejected',
      'donation_approved',
      'donation_rejected',
      'food_request_approved',
      'food_request_rejected',
      'new_request',
      'donation_claimed',
      'certificate',
      'general'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String, // Optional link to related page
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Additional data (certificateId, donationId, etc.)
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
