import Notification from '../models/notification.model.js';
import { emitToUser } from '../socket.js';

export const createNotification = async ({ userId, title, message, type = 'SYSTEM', meta }) => {
  const notification = await Notification.create({ userId, title, message, type, meta });
  const payload = {
    _id: notification._id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: false,
    createdAt: notification.createdAt,
    meta: notification.meta,
  };
  emitToUser(userId, 'notification', payload);
  return payload;
};

export const getUserNotifications = async (userId, page = 1, perPage = 20) => {
  const skip = (Math.max(1, page) - 1) * perPage;
  const [notifications, total] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    Notification.countDocuments({ userId }),
  ]);
  return {
    data: notifications.map((n) => ({
      _id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
      meta: n.meta,
    })),
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  };
};

export const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new Error('Notification not found');
  return notification;
};

export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { modifiedCount: result.modifiedCount };
};

export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, isRead: false });
};
