/**
 * Certificate Model
 * Stores donation certificates issued after successful donations
 */

import mongoose from 'mongoose';
import crypto from 'crypto';

const certificateSchema = new mongoose.Schema({
  // Unique certificate ID for sharing
  certificateId: {
    type: String,
    unique: true,
    required: true,
  },
  // Reference to the completed donation
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true,
  },
  // Reference to the completed request
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
  },
  // Donor who made the donation
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Receiver who received the donation
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Certificate details (snapshot at time of completion)
  donorName: {
    type: String,
    required: true,
  },
  receiverName: {
    type: String,
    required: true,
  },
  foodTitle: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  // Certificate image URL (stored on Cloudinary)
  imageUrl: {
    type: String,
  },
  // OG meta data
  ogTitle: {
    type: String,
    default: function() {
      return `${this.donorName} donated food through Feed In Need!`;
    },
  },
  ogDescription: {
    type: String,
    default: function() {
      return `${this.donorName} generously donated "${this.foodTitle}" (${this.quantity}) to help reduce food waste and hunger. Join us in making a difference!`;
    },
  },
  // Timestamps
  completedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate unique certificate ID before saving
certificateSchema.pre('validate', function (next) {
  if (!this.certificateId) {
    // Generate a unique 12 character alphanumeric ID
    this.certificateId = crypto.randomBytes(6).toString('hex').toUpperCase();
  }
  next();
});

// Index for quick lookup (certificateId already has unique: true, so we don't need explicit index)
certificateSchema.index({ donor: 1 });
certificateSchema.index({ donation: 1 });

// Static method to generate certificate from completed request
certificateSchema.statics.generateCertificate = async function(request, donation, donor, receiver) {
  const certificate = await this.create({
    donation: donation._id,
    request: request._id,
    donor: donor._id,
    receiver: receiver._id,
    donorName: donor.name,
    receiverName: receiver.name,
    foodTitle: donation.foodTitle,
    quantity: donation.quantity,
    address: donation.address,
    completedAt: request.completedAt || new Date(),
  });
  
  return certificate;
};

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
