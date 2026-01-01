/**
 * Request Controller
 * Handles food request operations by receivers
 */

import Request from '../models/Request.js';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import Certificate from '../models/Certificate.js';
import Notification from '../models/Notification.js';
import { sendFoodRequestNotification } from '../config/email.js';

/**
 * Generate confirmation code and QR data for pickup
 */
const generatePickupCredentials = (requestId, donationId) => {
  const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  // QR code data contains JSON with pickup information
  const qrCodeData = JSON.stringify({
    type: 'FEED_IN_NEED_PICKUP',
    requestId: requestId ? requestId.toString() : null,
    donationId: donationId.toString(),
    code: confirmationCode,
    timestamp: Date.now(),
  });
  return { confirmationCode, qrCodeData };
};

/**
 * @desc    Create food request
 * @route   POST /api/requests
 * @access  Private (Verified Receiver)
 */
export const createRequest = async (req, res, next) => {
  try {
    const { donationId, message, servingsNeeded } = req.body;

    // Check if non-trusted receiver is providing a message
    if (!req.user.isTrusted && (!message || message.trim().length < 20)) {
      return res.status(400).json({
        success: false,
        message: 'Please explain why you need this food and who will benefit from it (minimum 20 characters)',
      });
    }

    // Check if donation exists
    const donation = await Donation.findById(donationId).populate('donor');
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    // Check if donation is available
    if (donation.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'This donation is no longer available',
      });
    }

    // Check if donation is expired
    if (new Date() > donation.expiryDateTime) {
      return res.status(400).json({
        success: false,
        message: 'This donation has expired',
      });
    }

    // Check if user already requested this donation
    const existingRequest = await Request.findOne({
      receiver: req.user._id,
      donation: donationId,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested this donation',
      });
    }

    // Check if both donor and receiver are trusted (auto-approve)
    // Auto-approve if receiver is trusted (they've proven reliable)
    // or if both donor and receiver are trusted
    const isTrustedReceiver = req.user.isTrusted === true;
    const isTrustedDonor = donation.donor?.isTrusted === true;
    const shouldAutoApprove = isTrustedReceiver || (isTrustedReceiver && isTrustedDonor);

    // Determine the auto-approval reason
    let autoApprovalReason = '';
    if (shouldAutoApprove) {
      if (isTrustedReceiver && isTrustedDonor) {
        autoApprovalReason = 'Auto-approved: Both donor and receiver are trusted users';
      } else if (isTrustedReceiver) {
        autoApprovalReason = 'Auto-approved: Receiver is a trusted user';
      }
    }

    // Generate pickup credentials if auto-approved
    let pickupCredentials = {};
    if (shouldAutoApprove) {
      pickupCredentials = generatePickupCredentials(null, donationId); // Will update requestId after creation
    }

    // Create request
    const request = await Request.create({
      receiver: req.user._id,
      donation: donationId,
      message,
      servingsNeeded,
      status: shouldAutoApprove ? 'approved' : 'pending',
      confirmationCode: pickupCredentials.confirmationCode || undefined,
      qrCodeData: pickupCredentials.qrCodeData || undefined,
      reviewedAt: shouldAutoApprove ? new Date() : undefined,
      reviewNotes: autoApprovalReason || undefined,
    });

    // Update QR code data with actual request ID if auto-approved
    if (shouldAutoApprove) {
      const updatedQrData = JSON.stringify({
        type: 'FEED_IN_NEED_PICKUP',
        requestId: request._id.toString(),
        donationId: donationId.toString(),
        code: request.confirmationCode,
        timestamp: Date.now(),
      });
      request.qrCodeData = updatedQrData;
      await request.save();
    }

    // Update donation status
    await Donation.findByIdAndUpdate(donationId, { 
      status: shouldAutoApprove ? 'claimed' : 'requested' 
    });

    // Send notification to admin only if not auto-approved
    if (!shouldAutoApprove) {
      await sendFoodRequestNotification(request, req.user, donation);
    }

    // Determine the success message
    let successMessage = 'Request submitted successfully. Waiting for admin approval.';
    if (shouldAutoApprove) {
      if (isTrustedReceiver && isTrustedDonor) {
        successMessage = 'Request auto-approved! Both you and the donor are trusted users. You can proceed to pickup.';
      } else if (isTrustedReceiver) {
        successMessage = 'Request auto-approved! As a trusted user, you can proceed to pickup.';
      }
    }

    res.status(201).json({
      success: true,
      message: successMessage,
      data: request,
      autoApproved: shouldAutoApprove,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my requests (receiver)
 * @route   GET /api/requests/my
 * @access  Private (Receiver)
 */
export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ receiver: req.user._id })
      .populate({
        path: 'donation',
        populate: {
          path: 'donor',
          select: 'name email phone',
        },
      })
      .sort({ createdAt: -1 });

    // Hide donor contact for pending requests
    const processedRequests = requests.map((request) => {
      const reqObj = request.toObject();
      if (request.status !== 'approved' && reqObj.donation?.donor) {
        reqObj.donation.donor = {
          _id: reqObj.donation.donor._id,
          name: reqObj.donation.donor.name,
        };
        reqObj.donation.donorPhone = 'Hidden (Approval required)';
      }
      return reqObj;
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: processedRequests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single request
 * @route   GET /api/requests/:id
 * @access  Private
 */
export const getRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate({
        path: 'donation',
        populate: {
          path: 'donor',
          select: 'name email phone',
        },
      })
      .populate('receiver', 'name email phone receiverType address');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Check authorization
    if (
      request.receiver._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel request
 * @route   DELETE /api/requests/:id
 * @access  Private (Receiver - owner)
 */
export const cancelRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Check ownership
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request',
      });
    }

    // Can only cancel pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending requests',
      });
    }

    // Update request status
    request.status = 'cancelled';
    await request.save();

    // Update donation status back to available
    await Donation.findByIdAndUpdate(request.donation, { status: 'available' });

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark request as completed
 * @route   PUT /api/requests/:id/complete
 * @access  Private (Receiver - owner)
 */
export const completeRequest = async (req, res, next) => {
  try {
    const { confirmationCode } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Check ownership
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Can only complete approved requests
    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Can only complete approved requests',
      });
    }

    // Verify confirmation code
    if (!confirmationCode || confirmationCode.toUpperCase() !== request.confirmationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid confirmation code. Please get the correct code from the donor.',
      });
    }

    // Update request
    request.status = 'completed';
    request.completedAt = Date.now();
    await request.save();

    // Update donation status to completed (receiver has received the food)
    const donation = await Donation.findByIdAndUpdate(request.donation, {
      status: 'completed',
      claimedBy: req.user._id,
      claimedAt: Date.now(),
    }, { new: true });

    // Get full donation and user details for certificate
    const fullDonation = await Donation.findById(request.donation);
    const donor = await User.findById(fullDonation.donor);
    const receiver = await User.findById(request.receiver);

    // Increment successful transaction counts
    await User.findByIdAndUpdate(donation.donor, {
      $inc: { successfulDonations: 1 }
    });
    await User.findByIdAndUpdate(request.receiver, {
      $inc: { successfulReceives: 1 }
    });

    // Generate donation certificate
    let certificate = null;
    try {
      certificate = await Certificate.generateCertificate(request, fullDonation, donor, receiver);
      
      // Create notification for donor about certificate
      await Notification.create({
        user: donor._id,
        type: 'certificate',
        title: 'Donation Certificate Ready! 🎉',
        message: `Your donation of "${fullDonation.foodTitle}" has been received by ${receiver.name}. Your certificate is ready to share!`,
        data: {
          certificateId: certificate.certificateId,
          donationId: fullDonation._id,
          requestId: request._id,
        },
      });
    } catch (certError) {
      console.error('Failed to generate certificate:', certError);
      // Don't fail the request completion if certificate fails
    }

    res.status(200).json({
      success: true,
      message: 'Food received! Thank you for helping reduce food waste. Don\'t forget to rate your experience!',
      data: {
        requestId: request._id,
        canRate: true,
        certificate: certificate ? {
          certificateId: certificate.certificateId,
          shareUrl: `/share/certificate/${certificate.certificateId}`,
        } : null,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete request via QR code scan
 * @route   PUT /api/requests/complete-qr
 * @access  Private (Receiver)
 */
export const completeRequestViaQR = async (req, res, next) => {
  try {
    const { qrData } = req.body;

    // Parse QR code data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format',
      });
    }

    // Validate QR code data structure
    if (parsedData.type !== 'FEED_IN_NEED_PICKUP' || !parsedData.requestId || !parsedData.code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code. Please scan the correct pickup QR code.',
      });
    }

    const request = await Request.findById(parsedData.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Check ownership
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This QR code is not for your request',
      });
    }

    // Can only complete approved requests
    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Can only complete approved requests',
      });
    }

    // Verify confirmation code from QR
    if (parsedData.code !== request.confirmationCode) {
      return res.status(400).json({
        success: false,
        message: 'QR code verification failed. The code does not match.',
      });
    }

    // Update request
    request.status = 'completed';
    request.completedAt = Date.now();
    await request.save();

    // Update donation status to completed (receiver has received the food)
    const donation = await Donation.findByIdAndUpdate(request.donation, {
      status: 'completed',
      claimedBy: req.user._id,
      claimedAt: Date.now(),
    }, { new: true });

    // Get full donation and user details for certificate
    const fullDonation = await Donation.findById(request.donation);
    const donor = await User.findById(fullDonation.donor);
    const receiver = await User.findById(request.receiver);

    // Increment successful transaction counts
    await User.findByIdAndUpdate(donation.donor, {
      $inc: { successfulDonations: 1 }
    });
    await User.findByIdAndUpdate(request.receiver, {
      $inc: { successfulReceives: 1 }
    });

    // Generate donation certificate
    let certificate = null;
    try {
      certificate = await Certificate.generateCertificate(request, fullDonation, donor, receiver);
      
      // Create notification for donor about certificate
      await Notification.create({
        user: donor._id,
        type: 'certificate',
        title: 'Donation Certificate Ready! 🎉',
        message: `Your donation of "${fullDonation.foodTitle}" has been received by ${receiver.name}. Your certificate is ready to share!`,
        data: {
          certificateId: certificate.certificateId,
          donationId: fullDonation._id,
          requestId: request._id,
        },
      });
    } catch (certError) {
      console.error('Failed to generate certificate:', certError);
    }

    res.status(200).json({
      success: true,
      message: 'QR code verified! Food pickup confirmed. Don\'t forget to rate your experience!',
      data: {
        requestId: request._id,
        canRate: true,
        donation: {
          _id: fullDonation._id,
          foodTitle: fullDonation.foodTitle,
          donor: {
            name: donor.name,
          }
        },
        certificate: certificate ? {
          certificateId: certificate.certificateId,
          shareUrl: `/share/certificate/${certificate.certificateId}`,
        } : null,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete request using only confirmation code (finds the matching approved request for this receiver)
 * @route   PUT /api/requests/complete-by-code
 * @access  Private (Receiver)
 */
export const completeRequestByCode = async (req, res, next) => {
  try {
    const { confirmationCode } = req.body;

    if (!confirmationCode) {
      return res.status(400).json({
        success: false,
        message: 'Confirmation code is required',
      });
    }

    // Find an approved request for this receiver with matching confirmation code
    const request = await Request.findOne({
      receiver: req.user._id,
      status: 'approved',
      confirmationCode: confirmationCode.toUpperCase(),
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Invalid confirmation code. Please check the code and ensure you have an approved request.',
      });
    }

    // Update request
    request.status = 'completed';
    request.completedAt = Date.now();
    await request.save();

    // Update donation status to completed
    const donation = await Donation.findByIdAndUpdate(request.donation, {
      status: 'completed',
      claimedBy: req.user._id,
      claimedAt: Date.now(),
    }, { new: true });

    // Get full donation and user details for certificate
    const fullDonation = await Donation.findById(request.donation);
    const donor = await User.findById(fullDonation.donor);
    const receiver = await User.findById(request.receiver);

    // Increment successful transaction counts
    await User.findByIdAndUpdate(donation.donor, {
      $inc: { successfulDonations: 1 }
    });
    await User.findByIdAndUpdate(request.receiver, {
      $inc: { successfulReceives: 1 }
    });

    // Generate donation certificate
    let certificate = null;
    try {
      certificate = await Certificate.generateCertificate(request, fullDonation, donor, receiver);
      
      // Create notification for donor about certificate
      await Notification.create({
        user: donor._id,
        type: 'certificate',
        title: 'Donation Certificate Ready! 🎉',
        message: `Your donation of "${fullDonation.foodTitle}" has been received by ${receiver.name}. Your certificate is ready to share!`,
        data: {
          certificateId: certificate.certificateId,
          donationId: fullDonation._id,
          requestId: request._id,
        },
      });
    } catch (certError) {
      console.error('Failed to generate certificate:', certError);
    }

    res.status(200).json({
      success: true,
      message: 'Food pickup confirmed! Thank you for helping reduce food waste.',
      data: {
        _id: request._id,
        requestId: request._id,
        canRate: true,
        donation: {
          _id: fullDonation._id,
          foodTitle: fullDonation.foodTitle,
          donor: {
            name: donor.name,
          }
        },
        certificate: certificate ? {
          certificateId: certificate.certificateId,
          shareUrl: `/share/certificate/${certificate.certificateId}`,
        } : null,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get QR code data for pickup (for donor to show)
 * @route   GET /api/requests/:id/qr-data
 * @access  Private (Donor - owner of donation)
 */
export const getPickupQRData = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate('donation');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    const donation = await Donation.findById(request.donation);

    // Check if user is the donor
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the donor can view pickup QR code',
      });
    }

    // Request must be approved
    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'QR code is only available for approved requests',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        qrCodeData: request.qrCodeData,
        confirmationCode: request.confirmationCode,
      },
    });
  } catch (error) {
    next(error);
  }
};
