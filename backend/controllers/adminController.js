/**
 * Admin Controller
 * Handles admin-specific operations
 */

import User from '../models/User.js';
import Donation from '../models/Donation.js';
import Request from '../models/Request.js';
import Message from '../models/Message.js';
import { sendVerificationResult, sendAdminMessageToUser } from '../config/email.js';
import { createNotification } from './notificationController.js';

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalDonations,
      completedDonations,
      availableDonations,
      claimedDonations,
      pendingApprovalDonations,
      totalDonors,
      pendingDonors,
      verifiedDonors,
      totalReceivers,
      pendingReceivers,
      verifiedReceivers,
      totalRequests,
      pendingRequests,
    ] = await Promise.all([
      Donation.countDocuments({ isApproved: true }), // All approved donations
      Request.countDocuments({ status: 'completed' }), // Only count completed transactions where receiver got food
      Donation.countDocuments({ status: 'available', isApproved: true }),
      Donation.countDocuments({ status: 'claimed' }),
      Donation.countDocuments({ isApproved: false }),
      User.countDocuments({ role: 'donor', verificationStatus: 'approved' }), // Only count approved donors
      User.countDocuments({ role: 'donor', verificationStatus: 'pending', isEmailVerified: true }), // Only count email-verified pending donors
      User.countDocuments({ role: 'donor', verificationStatus: 'approved' }),
      User.countDocuments({ role: 'receiver', verificationStatus: 'approved' }), // Only count approved receivers
      User.countDocuments({ role: 'receiver', verificationStatus: 'pending', isEmailVerified: true }), // Only count email-verified pending receivers
      User.countDocuments({ role: 'receiver', verificationStatus: 'approved' }),
      Request.countDocuments(),
      Request.countDocuments({ status: 'pending' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        donations: {
          total: totalDonations,
          completed: completedDonations, // Only completed donations where receiver received food
          available: availableDonations,
          claimed: claimedDonations,
          pendingApproval: pendingApprovalDonations,
        },
        donors: {
          total: totalDonors,
          pending: pendingDonors,
          verified: verifiedDonors,
        },
        receivers: {
          total: totalReceivers,
          pending: pendingReceivers,
          verified: verifiedReceivers,
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all donations (admin)
 * @route   GET /api/admin/donations
 * @access  Private (Admin)
 */
export const getAllDonations = async (req, res, next) => {
  try {
    const { status, approved, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (approved !== undefined) query.isApproved = approved === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone')
      .populate('claimedBy', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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
 * @desc    Approve/Reject donation
 * @route   PUT /api/admin/donations/:id/approve
 * @access  Private (Admin)
 */
export const approveDonation = async (req, res, next) => {
  try {
    const { approved } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Please provide approved status (true/false)',
      });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    donation.isApproved = approved;
    if (approved) {
      donation.approvedBy = req.user._id;
      donation.approvedAt = Date.now();
    }
    await donation.save();

    // Create notification for donor
    await createNotification(
      donation.donor,
      approved ? 'donation_approved' : 'donation_rejected',
      approved ? '✅ Donation Approved!' : '❌ Donation Not Approved',
      approved 
        ? `Your donation "${donation.foodTitle}" has been approved! It is now visible to receivers. You can share it on social media.`
        : `Your donation "${donation.foodTitle}" was not approved. Please check the donation details and try again.`,
      '/my-donations'
    );

    res.status(200).json({
      success: true,
      message: `Donation ${approved ? 'approved' : 'rejected'} successfully`,
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all receivers
 * @route   GET /api/admin/receivers
 * @access  Private (Admin)
 */
export const getAllReceivers = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Only show email-verified receivers
    const query = { role: 'receiver', isEmailVerified: true };
    
    // If status is 'pending', also show rejected users (they can re-apply)
    if (status === 'pending') {
      query.verificationStatus = { $in: ['pending', 'rejected'] };
    } else if (status) {
      query.verificationStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const receivers = await User.find(query)
      .select('-password')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: receivers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: receivers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify receiver (approve/reject)
 * @route   PUT /api/admin/receivers/:id/verify
 * @access  Private (Admin)
 */
export const verifyReceiver = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"',
      });
    }

    // Require rejection reason when rejecting
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for rejection',
      });
    }

    const receiver = await User.findById(req.params.id);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
    }

    if (receiver.role !== 'receiver') {
      return res.status(400).json({
        success: false,
        message: 'User is not a receiver',
      });
    }

    // Update verification status
    receiver.verificationStatus = status;
    if (status === 'approved') {
      receiver.verifiedAt = Date.now();
      receiver.rejectionReason = undefined;
      receiver.rejectedAt = undefined;
      receiver.rejectedBy = undefined;
    } else {
      receiver.rejectionReason = rejectionReason;
      receiver.rejectedAt = Date.now();
      receiver.rejectedBy = req.user._id;
      receiver.verifiedAt = undefined;
    }
    await receiver.save();

    // Create notification for receiver
    await createNotification(
      receiver._id,
      status === 'approved' ? 'verification_approved' : 'verification_rejected',
      status === 'approved' ? '🎉 Account Verified!' : '❌ Verification Rejected',
      status === 'approved' 
        ? 'Congratulations! Your account has been verified. You can now request food donations.'
        : `Your verification request was rejected. Reason: ${rejectionReason}. Please update your profile and request re-verification.`,
      '/profile'
    );

    // Send email to receiver
    await sendVerificationResult(receiver, status === 'approved', rejectionReason);

    res.status(200).json({
      success: true,
      message: `Receiver ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      data: receiver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all donors
 * @route   GET /api/admin/donors
 * @access  Private (Admin)
 */
export const getAllDonors = async (req, res, next) => {
  try {
    const { status, donorType, page = 1, limit = 20 } = req.query;

    const query = { role: 'donor', isEmailVerified: true }; // Only show email-verified donors
    
    // If status is 'pending', also show rejected users (they can re-apply)
    if (status === 'pending') {
      query.verificationStatus = { $in: ['pending', 'rejected'] };
    } else if (status) {
      query.verificationStatus = status;
    }
    
    if (donorType) query.donorType = donorType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donors = await User.find(query)
      .select('-password')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: donors.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: donors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify donor (approve/reject)
 * @route   PUT /api/admin/donors/:id/verify
 * @access  Private (Admin)
 */
export const verifyDonor = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"',
      });
    }

    // Require rejection reason when rejecting
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for rejection',
      });
    }

    const donor = await User.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    if (donor.role !== 'donor') {
      return res.status(400).json({
        success: false,
        message: 'User is not a donor',
      });
    }

    // Update verification status
    donor.verificationStatus = status;
    if (status === 'approved') {
      donor.verifiedAt = Date.now();
      donor.rejectionReason = undefined;
      donor.rejectedAt = undefined;
      donor.rejectedBy = undefined;
    } else {
      donor.rejectionReason = rejectionReason;
      donor.rejectedAt = Date.now();
      donor.rejectedBy = req.user._id;
      donor.verifiedAt = undefined;
    }
    await donor.save();

    // Create notification for donor
    await createNotification(
      donor._id,
      status === 'approved' ? 'verification_approved' : 'verification_rejected',
      status === 'approved' ? '🎉 Account Verified!' : '❌ Verification Rejected',
      status === 'approved' 
        ? 'Congratulations! Your account has been verified. Your donations will now be trusted and visible to receivers.'
        : `Your verification request was rejected. Reason: ${rejectionReason}. Please update your profile and request re-verification.`,
      '/profile'
    );

    // Send email to donor
    await sendVerificationResult(donor, status === 'approved', rejectionReason);

    res.status(200).json({
      success: true,
      message: `Donor ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      data: donor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all food requests
 * @route   GET /api/admin/requests
 * @access  Private (Admin)
 */
export const getAllRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await Request.find(query)
      .populate('receiver', 'name email phone receiverType address verificationStatus')
      .populate({
        path: 'donation',
        populate: {
          path: 'donor',
          select: 'name email phone',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Request.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve/Reject food request
 * @route   PUT /api/admin/requests/:id
 * @access  Private (Admin)
 */
export const handleRequest = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"',
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only process pending requests',
      });
    }

    // Update request
    request.status = status;
    request.reviewedBy = req.user._id;
    request.reviewedAt = Date.now();
    request.reviewNotes = reviewNotes;
    
    // Generate confirmation code and QR data if approved
    if (status === 'approved') {
      // Generate 6-digit confirmation code
      const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      request.confirmationCode = confirmationCode;
      
      // Generate QR code data
      request.qrCodeData = JSON.stringify({
        type: 'FEED_IN_NEED_PICKUP',
        requestId: request._id.toString(),
        donationId: request.donation.toString(),
        code: confirmationCode,
        timestamp: Date.now(),
      });
    }
    
    await request.save();

    // Get donation details for notification
    const donation = await Donation.findById(request.donation);

    // Create notification for receiver
    await createNotification(
      request.receiver,
      status === 'approved' ? 'food_request_approved' : 'food_request_rejected',
      status === 'approved' ? '🎉 Food Request Approved!' : '❌ Request Not Approved',
      status === 'approved' 
        ? `Your request for "${donation?.foodTitle || 'food'}" has been approved! Contact the donor to arrange pickup.`
        : `Your request for "${donation?.foodTitle || 'food'}" was not approved. ${reviewNotes || 'Please try other available donations.'}`,
      '/my-requests'
    );

    // Also notify the donor if request was approved
    if (status === 'approved' && donation) {
      await createNotification(
        donation.donor,
        'new_request',
        '📬 New Approved Request!',
        `Someone has been approved to receive your donation "${donation.foodTitle}". Check your donations for handover code.`,
        '/my-donations'
      );
      
      // Update donation status to 'claimed' so donor can see handover code
      await Donation.findByIdAndUpdate(request.donation, { status: 'claimed' });
    }

    // Update donation status back to available if rejected
    if (status === 'rejected') {
      await Donation.findByIdAndUpdate(request.donation, { status: 'available' });
    }

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting superadmin
    if (user.role === 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete superadmin',
      });
    }

    // Only superadmin can delete admins
    if (user.role === 'admin' && req.user.role !== 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Only superadmin can delete admin users',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all admins (superadmin only)
 * @route   GET /api/admin/admins
 * @access  Private (Superadmin)
 */
export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create admin (superadmin only)
 * @route   POST /api/admin/admins
 * @access  Private (Superadmin)
 */
export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete admin (superadmin only)
 * @route   DELETE /api/admin/admins/:id
 * @access  Private (Superadmin)
 */
export const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Prevent deleting superadmin
    if (admin.role === 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete superadmin',
      });
    }

    // Ensure user is actually an admin
    if (admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is not an admin',
      });
    }

    await admin.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send message to user (for profile corrections, etc.)
 * @route   POST /api/admin/users/:id/message
 * @access  Private (Admin)
 */
export const sendMessageToUser = async (req, res, next) => {
  try {
    const { subject, message, actionRequired } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject and message',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Save message to database (inbox)
    const savedMessage = await Message.create({
      recipient: user._id,
      sender: req.user._id,
      subject,
      message,
      actionRequired: actionRequired || null,
    });

    // Send email
    const emailSent = await sendAdminMessageToUser(user, subject, message, actionRequired);

    // Create in-app notification
    await createNotification(
      user._id,
      'admin_message',
      `📬 ${subject}`,
      message.substring(0, 200) + (message.length > 200 ? '...' : ''),
      '/inbox'
    );

    res.status(200).json({
      success: true,
      message: 'Message sent successfully' + (emailSent ? ' (Email + Inbox)' : ' (Inbox only, email failed)'),
      data: {
        userId: user._id,
        email: user.email,
        subject,
        messageId: savedMessage._id,
        emailSent,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user details by ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin)
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Give trusted badge to a user
 * @route   PUT /api/admin/users/:id/trust
 * @access  Private (Admin)
 */
export const giveTrustedBadge = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isTrusted) {
      return res.status(400).json({
        success: false,
        message: 'User already has the trusted badge',
      });
    }

    // Give trusted badge
    user.isTrusted = true;
    user.trustedAt = Date.now();
    user.trustedBy = req.user._id;
    // Clear any previous removal data
    user.trustedRemovedAt = undefined;
    user.trustedRemovedBy = undefined;
    user.trustedRemovalReason = undefined;
    await user.save();

    // Create notification for user
    await createNotification(
      user._id,
      'trusted_badge_given',
      '⭐ Trusted Badge Awarded!',
      'Congratulations! You have been awarded the Trusted Badge by an admin. Your donations will now be auto-approved and you can edit them anytime.',
      '/profile'
    );

    res.status(200).json({
      success: true,
      message: 'Trusted badge given successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove trusted badge from a user
 * @route   DELETE /api/admin/users/:id/trust
 * @access  Private (Admin)
 */
export const removeTrustedBadge = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for removing the trusted badge (minimum 10 characters)',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isTrusted) {
      return res.status(400).json({
        success: false,
        message: 'User does not have the trusted badge',
      });
    }

    // Remove trusted badge
    user.isTrusted = false;
    user.trustedAt = undefined;
    user.trustedBy = undefined;
    user.trustedRemovedAt = Date.now();
    user.trustedRemovedBy = req.user._id;
    user.trustedRemovalReason = reason;
    await user.save();

    // Create notification for user
    await createNotification(
      user._id,
      'trusted_badge_removed',
      '⚠️ Trusted Badge Removed',
      `Your Trusted Badge has been removed by an admin. Reason: ${reason}. Your donations will now require admin approval.`,
      '/profile'
    );

    res.status(200).json({
      success: true,
      message: 'Trusted badge removed successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
