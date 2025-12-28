/**
 * Donation Controller
 * Handles food donation CRUD operations
 */

import Donation from '../models/Donation.js';
import { sendDonationNotification, sendErrorNotification } from '../config/email.js';

/**
 * @desc    Create new donation
 * @route   POST /api/donations
 * @access  Private (Donor)
 */
export const createDonation = async (req, res, next) => {
  try {
    console.log('📥 Donation request received');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.files?.length || 0, 'files uploaded');

    const {
      donorPhone,
      foodTitle,
      foodDescription,
      quantity,
      storageCondition,
      expiryDateTime,
      latitude,
      longitude,
      address,
      notes,
    } = req.body;

    // Get uploaded food photos (array)
    const foodPhotos = req.files?.map(file => file.path) || [];
    console.log('Photo URLs:', foodPhotos);

    // Validate at least 1 photo
    if (foodPhotos.length === 0) {
      console.log('❌ No photos uploaded');
      return res.status(400).json({
        success: false,
        message: 'Please upload at least 1 food photo (max 3)',
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      console.log('❌ Invalid coordinates:', { latitude, longitude });
      return res.status(400).json({
        success: false,
        message: 'Invalid location coordinates',
      });
    }

    console.log('📍 Creating donation with coordinates:', { lat, lng });

    // Check if donor is trusted (auto-approve for trusted donors)
    const isTrustedDonor = req.user.isTrusted === true;

    // Create donation
    const donation = await Donation.create({
      donor: req.user._id,
      donorPhone,
      foodTitle,
      foodDescription,
      quantity,
      storageCondition: storageCondition || 'room_temperature',
      foodPhotos,
      expiryDateTime,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      address,
      notes,
      status: 'available',
      isApproved: isTrustedDonor, // Auto-approve for trusted donors
      approvedBy: isTrustedDonor ? req.user._id : undefined,
      approvedAt: isTrustedDonor ? new Date() : undefined,
    });

    console.log('✅ Donation created:', donation._id, isTrustedDonor ? '(Auto-approved - Trusted Donor)' : '');

    // Send notification to admin only if not auto-approved
    if (!isTrustedDonor) {
      sendDonationNotification(donation, req.user).catch(err => {
        console.error('Email notification failed:', err.message);
      });
    }

    res.status(201).json({
      success: true,
      message: isTrustedDonor 
        ? 'Thank you for your donation! As a trusted donor, your donation has been auto-approved.'
        : 'Thank you for your donation! It has been submitted and is pending admin approval.',
      data: donation,
    });
  } catch (error) {
    console.error('❌ Donation creation error:', error);
    
    // Send error details via email for debugging
    sendErrorNotification('Donation Creation Error', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      user: req.user?.email,
      files: req.files?.length || 0,
    }).catch(err => console.error('Error email failed:', err.message));

    next(error);
  }
};

/**
 * @desc    Get all available donations
 * @route   GET /api/donations
 * @access  Public
 */
export const getDonations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, search, latitude, longitude } = req.query;

    // Build query
    const query = {
      isApproved: true, // Only show approved donations publicly
    };
    
    if (status) {
      query.status = status;
    } else {
      query.status = 'available';
    }

    // Search by food title
    if (search) {
      query.foodTitle = { $regex: search, $options: 'i' };
    }

    // Exclude expired donations
    query.expiryDateTime = { $gt: new Date() };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let donations;
    
    // If user location is provided, sort by nearest location
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Use aggregation for distance-based sorting
        // $geoNear must be the first stage in the pipeline
        donations = await Donation.aggregate([
          {
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: [lng, lat],
              },
              distanceField: 'distance',
              spherical: true,
              query: query, // Apply all filters here
            },
          },
          { $skip: skip },
          { $limit: parseInt(limit) },
          {
            $lookup: {
              from: 'users',
              localField: 'donor',
              foreignField: '_id',
              as: 'donor',
              pipeline: [{ $project: { name: 1, email: 1 } }],
            },
          },
          { $unwind: { path: '$donor', preserveNullAndEmptyArrays: true } },
        ]);
        
        // Convert distance from meters to km
        donations = donations.map(d => ({
          ...d,
          distance: d.distance ? (d.distance / 1000).toFixed(1) : null, // km
        }));
      } else {
        // Fallback to regular query
        donations = await Donation.find(query)
          .populate('donor', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
      }
    } else {
      // Regular query without location sorting
      donations = await Donation.find(query)
        .populate('donor', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    const total = await Donation.countDocuments(query);

    res.status(200).json({
      success: true,
      count: donations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: donations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single donation
 * @route   GET /api/donations/:id
 * @access  Public
 */
export const getDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone')
      .populate('claimedBy', 'name email phone');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    // Check if donation is approved (allow donor and admin to see unapproved)
    const isOwner = req.user && donation.donor._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!donation.isApproved && !isOwner && !isAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    // Hide donor contact info from non-verified users
    let donationData = donation.toObject();
    
    if (req.user && req.user.role === 'receiver' && req.user.verificationStatus !== 'approved') {
      donationData.donor = {
        _id: donation.donor._id,
        name: donation.donor.name,
      };
      donationData.donorPhone = 'Hidden (Verification required)';
    }

    res.status(200).json({
      success: true,
      data: donationData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my donations (donor)
 * @route   GET /api/donations/my
 * @access  Private (Donor)
 */
export const getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('claimedBy', 'name email phone')
      .sort({ createdAt: -1 });

    // For completed donations, get the request info to allow rating
    const Request = (await import('../models/Request.js')).default;
    
    const donationsWithRequestInfo = await Promise.all(
      donations.map(async (donation) => {
        const donationObj = donation.toObject();
        
        // If donation is completed, get the request info
        if (donation.status === 'completed') {
          const request = await Request.findOne({
            donation: donation._id,
            status: 'completed',
          }).populate('receiver', 'name');
          
          if (request) {
            donationObj.completedRequest = {
              _id: request._id,
              receiverName: request.receiver?.name,
              receiverRated: request.receiverRated,
              completedAt: request.completedAt,
            };
          }
        }
        
        return donationObj;
      })
    );

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donationsWithRequestInfo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get approved request for my donation (for confirmation code)
 * @route   GET /api/donations/:id/approved-request
 * @access  Private (Donor - owner)
 */
export const getApprovedRequest = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    // Check ownership
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Find approved request for this donation
    const Request = (await import('../models/Request.js')).default;
    const request = await Request.findOne({
      donation: req.params.id,
      status: 'approved',
    }).populate('receiver', 'name email phone receiverType isTrusted');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'No approved request found for this donation',
      });
    }

    // Generate confirmation code and QR data if they don't exist (for older approvals)
    if (!request.confirmationCode) {
      request.confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    if (!request.qrCodeData) {
      request.qrCodeData = JSON.stringify({
        type: 'FEED_IN_NEED_PICKUP',
        requestId: request._id.toString(),
        donationId: req.params.id,
        code: request.confirmationCode,
        timestamp: Date.now(),
      });
    }
    
    await request.save();

    res.status(200).json({
      success: true,
      data: {
        confirmationCode: request.confirmationCode,
        qrCodeData: request.qrCodeData,
        receiver: request.receiver,
        message: request.message,
        approvedAt: request.reviewedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update donation
 * @route   PUT /api/donations/:id
 * @access  Private (Donor - owner)
 */
export const updateDonation = async (req, res, next) => {
  try {
    let donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    // Check ownership
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation',
      });
    }

    // Prevent editing after donation is claimed - no donor (trusted or not) can edit except admin
    if (donation.status === 'claimed' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit donation after it has been claimed by a receiver',
      });
    }

    // Prevent editing after donation is completed (received by receiver) - no one except admin can edit
    if (donation.status === 'completed' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit donation after it has been received by the receiver',
      });
    }

    // Prevent editing after approval (except for admins and trusted donors with available/requested status)
    if (donation.isApproved && req.user.role !== 'admin' && !req.user.isTrusted) {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit donation after it has been approved by admin',
      });
    }

    // Update fields
    const updateFields = { ...req.body };
    
    // Handle location update
    if (req.body.latitude && req.body.longitude) {
      updateFields.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
      };
      delete updateFields.latitude;
      delete updateFields.longitude;
    }

    // Handle photo update
    if (req.file) {
      updateFields.foodPhoto = req.file.path;
    }

    donation = await Donation.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete donation
 * @route   DELETE /api/donations/:id
 * @access  Private (Donor - owner, Admin)
 */
export const deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    // Check ownership (allow admins and superadmins to delete any donation)
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (donation.donor.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this donation',
      });
    }

    await donation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get nearby donations
 * @route   GET /api/donations/nearby
 * @access  Public
 */
export const getNearbyDonations = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude',
      });
    }

    // Convert radius from km to meters
    const maxDistance = parseFloat(radius) * 1000;

    const donations = await Donation.find({
      status: 'available',
      expiryDateTime: { $gt: new Date() },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: maxDistance,
        },
      },
    }).populate('donor', 'name');

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    next(error);
  }
};
