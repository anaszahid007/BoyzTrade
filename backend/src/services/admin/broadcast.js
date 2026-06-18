import User from '../../models/user.model.js';
import Notification from '../../models/notification.model.js';
import ErrorResponse from '../../utils/ErrorResponse.js';
import { broadcast } from '../../socket.js';

/**
 * Send a notification to every registered user. Persists a notification
 * document per user and emits a real-time event via socket broadcast.
 * @param {Object} notification
 * @param {string} notification.title - Notification title.
 * @param {string} notification.message - Notification body.
 * @param {string} [notification.type='SYSTEM'] - Notification type.
 * @returns {Promise<{success: boolean, count: number}>}
 * @throws {ErrorResponse} 400 if title or message is missing.
 */
export const broadcastNotification = async ({ title, message, type = 'SYSTEM' }) => {
  if (!title || !message) {
    throw new ErrorResponse(400, 'Title and Message are required for broadcast');
  }

  const users = await User.find({}, '_id');
  if (users.length === 0) return { success: true, count: 0 };

  const notifications = users.map(user => ({
    userId: user._id,
    title,
    message,
    type,
    isRead: false
  }));

  await Notification.insertMany(notifications);

  broadcast('notification', {
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date(),
    meta: { isBroadcast: true }
  });

  return { success: true, count: users.length };
};
