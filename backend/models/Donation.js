/**
 * Donation Model
 * Stores all food donation records
 */

import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  // Donor reference
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Donor contact (can be different from registered phone)
  donorPhone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  // Food details
  foodTitle: {
    type: String,
    required: [true, 'Food title is required'],
    trim: true,
    maxlength: [200, 'Food title cannot exceed 200 characters'],
  },
  foodDescription: {
    type: String,
    required: [true, 'Food description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  quantity: {
    type: String,
    required: [true, 'Quantity is required'],
    trim: true,
  },
  storageCondition: {
    type: String,
    enum: ['refrigerated', 'frozen', 'room_temperature', 'hot'],
    default: 'room_temperature',
  },
  foodPhotos: {
    type: [String], // Array of Cloudinary URLs
    required: [true, 'At least one food photo is required'],
    validate: {
      validator: function(v) {
        return v && v.length >= 1 && v.length <= 3;
      },
      message: 'Please upload 1-3 photos'
    }
  },
  // Expiry information
  expiryDateTime: {
    type: Date,
    required: [true, 'Expiry date/time is required'],
  },
  // Location details
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  // Status of donation
  status: {
    type: String,
    enum: ['available', 'requested', 'claimed', 'completed', 'expired', 'cancelled'],
    default: 'available',
  },
  // Admin approval status
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
  // Who claimed the donation
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  claimedAt: {
    type: Date,
  },
  // Additional notes
  notes: {
    type: String,
    trim: true,
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

// Index for geospatial queries
donationSchema.index({ location: '2dsphere' });

// Index for status queries
donationSchema.index({ status: 1 });

// Update timestamp
donationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Check if donation is expired
donationSchema.methods.isExpired = function () {
  return new Date() > this.expiryDateTime;
};

// Virtual for time remaining
donationSchema.virtual('timeRemaining').get(function () {
  const now = new Date();
  const expiry = new Date(this.expiryDateTime);
  const diff = expiry - now;
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day(s)`;
  }
  
  return `${hours}h ${minutes}m`;
});

// Enable virtuals in JSON output
donationSchema.set('toJSON', { virtuals: true });
donationSchema.set('toObject', { virtuals: true });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
