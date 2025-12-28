/**
 * Message Routes
 * User inbox routes
 */

import express from 'express';
import {
  getMyMessages,
  getMessage,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  getUnreadCount,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getMyMessages);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.get('/:id', getMessage);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteMessage);

export default router;
