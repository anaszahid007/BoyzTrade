import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  listNotifications,
  markRead,
  markAllRead,
  unreadCount,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', listNotifications);
router.get('/unread-count', unreadCount);
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);

export default router;
