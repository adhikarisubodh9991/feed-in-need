/**
 * Rating Model
 * Stores ratings given by users after food donation completion
 */

import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  // The request this rating is for
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
  },
  // The donation this rating is for
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true,
  },
  // Who is being rated (donor or receiver)
  ratedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Who gave the rating
  ratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Type of rating (donor_to_receiver or receiver_to_donor)
  ratingType: {
    type: String,
    enum: ['donor_to_receiver', 'receiver_to_donor'],
    required: true,
  },
  // Rating value (1-5 stars)
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  // Optional feedback/comment
  feedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Feedback cannot exceed 500 characters'],
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate ratings
ratingSchema.index({ request: 1, ratedBy: 1, ratingType: 1 }, { unique: true });

// Index for user ratings queries
ratingSchema.index({ ratedUser: 1 });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
