/**
 * Rating Controller
 * Handles rating operations for donors and receivers
 */

import Rating from '../models/Rating.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import Donation from '../models/Donation.js';

// Constants for trusted badge
const TRUSTED_BADGE_MIN_TRANSACTIONS = 3; // Minimum successful transactions
const TRUSTED_BADGE_MIN_RATING = 4.0; // Minimum average rating

/**
 * @desc    Submit rating after food pickup completion
 * @route   POST /api/ratings
 * @access  Private
 */
export const submitRating = async (req, res, next) => {
  try {
    const { requestId, rating, feedback } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Find the request
    const request = await Request.findById(requestId).populate('donation');
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Request must be completed
    if (request.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed transactions',
      });
    }

    const donation = await Donation.findById(request.donation);
    const isDonor = donation.donor.toString() === req.user._id.toString();
    const isReceiver = request.receiver.toString() === req.user._id.toString();

    if (!isDonor && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to rate this transaction',
      });
    }

    // Determine rating type and rated user
    let ratingType, ratedUser;
    if (isDonor) {
      ratingType = 'donor_to_receiver';
      ratedUser = request.receiver;
      
      // Check if already rated
      if (request.receiverRated) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this receiver',
        });
      }
    } else {
      ratingType = 'receiver_to_donor';
      ratedUser = donation.donor;
      
      // Check if already rated
      if (request.donorRated) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this donor',
        });
      }
    }

    // Create the rating
    const newRating = await Rating.create({
      request: requestId,
      donation: request.donation,
      ratedUser,
      ratedBy: req.user._id,
      ratingType,
      rating,
      feedback: feedback || '',
    });

    // Update request rating flags
    if (isDonor) {
      request.receiverRated = true;
    } else {
      request.donorRated = true;
    }
    await request.save();

    // Update rated user's average rating
    await updateUserRatingStats(ratedUser);

    // Check if both parties have rated - if so, check for trusted badge eligibility
    if (request.donorRated && request.receiverRated) {
      await checkAndAwardTrustedBadge(donation.donor);
      await checkAndAwardTrustedBadge(request.receiver);
    }

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: newRating,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this transaction',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get ratings for a user
 * @route   GET /api/ratings/user/:userId
 * @access  Public
 */
export const getUserRatings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ratings = await Rating.find({ ratedUser: userId })
      .populate('ratedBy', 'name avatar')
      .populate('donation', 'foodTitle')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rating.countDocuments({ ratedUser: userId });

    // Get user's rating stats
    const user = await User.findById(userId).select('averageRating totalRatings isTrusted');

    res.status(200).json({
      success: true,
      data: {
        ratings,
        stats: {
          averageRating: user?.averageRating || 0,
          totalRatings: user?.totalRatings || 0,
          isTrusted: user?.isTrusted || false,
        },
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if user can rate a request
 * @route   GET /api/ratings/can-rate/:requestId
 * @access  Private
 */
export const canRateRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId).populate('donation');
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    const donation = await Donation.findById(request.donation);
    const isDonor = donation.donor.toString() === req.user._id.toString();
    const isReceiver = request.receiver.toString() === req.user._id.toString();

    if (!isDonor && !isReceiver) {
      return res.status(200).json({
        success: true,
        data: { canRate: false, reason: 'Not a participant in this transaction' },
      });
    }

    if (request.status !== 'completed') {
      return res.status(200).json({
        success: true,
        data: { canRate: false, reason: 'Transaction not completed yet' },
      });
    }

    const alreadyRated = isDonor ? request.receiverRated : request.donorRated;

    res.status(200).json({
      success: true,
      data: {
        canRate: !alreadyRated,
        alreadyRated,
        ratingType: isDonor ? 'donor_to_receiver' : 'receiver_to_donor',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update user's rating statistics
 */
async function updateUserRatingStats(userId) {
  const ratings = await Rating.find({ ratedUser: userId });
  
  if (ratings.length === 0) {
    await User.findByIdAndUpdate(userId, {
      averageRating: 0,
      totalRatings: 0,
    });
    return;
  }

  const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / ratings.length;

  await User.findByIdAndUpdate(userId, {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalRatings: ratings.length,
  });
}

/**
 * Helper function to check and award trusted badge
 */
async function checkAndAwardTrustedBadge(userId) {
  // Refresh user data from database
  const user = await User.findById(userId);
  
  if (!user || user.isTrusted) {
    return; // Already trusted or user not found
  }

  // Count successful transactions based on COMPLETED requests
  let successfulCount = 0;
  
  if (user.role === 'donor') {
    // Count completed requests for donations made by this donor
    const donorDonations = await Donation.find({ donor: userId }).select('_id');
    const donationIds = donorDonations.map(d => d._id);
    const completedCount = await Request.countDocuments({
      donation: { $in: donationIds },
      status: 'completed',
    });
    successfulCount = completedCount;
    
    // Update the count
    await User.findByIdAndUpdate(userId, { successfulDonations: completedCount });
  } else if (user.role === 'receiver') {
    // Count completed requests made by this receiver
    const completedRequests = await Request.countDocuments({
      receiver: userId,
      status: 'completed',
    });
    successfulCount = completedRequests;
    
    // Update the count
    await User.findByIdAndUpdate(userId, { successfulReceives: completedRequests });
  }
  
  // Refresh user to get updated averageRating after rating was submitted
  const refreshedUser = await User.findById(userId);
  
  // Check eligibility for trusted badge
  // Must have minimum transactions and good average rating
  console.log(`Checking trusted badge for user ${userId}: successfulCount=${successfulCount}, averageRating=${refreshedUser?.averageRating}, minTransactions=${TRUSTED_BADGE_MIN_TRANSACTIONS}, minRating=${TRUSTED_BADGE_MIN_RATING}`);
  
  if (
    successfulCount >= TRUSTED_BADGE_MIN_TRANSACTIONS &&
    refreshedUser?.averageRating >= TRUSTED_BADGE_MIN_RATING
  ) {
    await User.findByIdAndUpdate(userId, {
      isTrusted: true,
      trustedAt: new Date(),
    });
    
    console.log(`✅ Trusted badge awarded to user: ${user.email}`);
  }
}

/**
 * @desc    Get rating stats for current user
 * @route   GET /api/ratings/my-stats
 * @access  Private
 */
export const getMyRatingStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      'averageRating totalRatings isTrusted trustedAt successfulDonations successfulReceives'
    );

    const ratingsGiven = await Rating.countDocuments({ ratedBy: req.user._id });
    const ratingsReceived = await Rating.countDocuments({ ratedUser: req.user._id });

    // Get breakdown by rating value
    const ratingBreakdown = await Rating.aggregate([
      { $match: { ratedUser: req.user._id } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        averageRating: user.averageRating,
        totalRatings: user.totalRatings,
        isTrusted: user.isTrusted,
        trustedAt: user.trustedAt,
        successfulDonations: user.successfulDonations || 0,
        successfulReceives: user.successfulReceives || 0,
        ratingsGiven,
        ratingsReceived,
        ratingBreakdown: ratingBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        trustedBadgeRequirements: {
          minTransactions: TRUSTED_BADGE_MIN_TRANSACTIONS,
          minRating: TRUSTED_BADGE_MIN_RATING,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  submitRating,
  getUserRatings,
  canRateRequest,
  getMyRatingStats,
};
