/**
 * Message Controller
 * Handles user inbox operations
 */

import Message from '../models/Message.js';

/**
 * @desc    Get user's messages (inbox)
 * @route   GET /api/messages
 * @access  Private
 */
export const getMyMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);
    const unreadCount = await Message.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });

    res.status(200).json({
      success: true,
      data: messages,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single message
 * @route   GET /api/messages/:id
 * @access  Private
 */
export const getMessage = async (req, res, next) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    }).populate('sender', 'name email role');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Mark as read if not already
    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark message as read
 * @route   PUT /api/messages/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all messages as read
 * @route   PUT /api/messages/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await Message.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'All messages marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread message count
 * @route   GET /api/messages/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyMessages,
  getMessage,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  getUnreadCount,
};
