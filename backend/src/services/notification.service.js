import Notification from '../models/notification.model.js';
import { emitToUser } from '../socket.js';
import ErrorResponse from '../utils/ErrorResponse.js';

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
  if (!notification) throw new ErrorResponse(404, 'Notification not found');
  return notification;
};

export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { modifiedCount: result.modifiedCount };
};

export const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ userId, isRead: false });
  if (!count) throw new ErrorResponse(404, 'Unread count not found');
  return count;
};


export const getUserUnreadNotifications = async (userId) => {
  try {
    const unreadNotifications = await Notification.find({ userId, isRead: false });
    if (!unreadNotifications) throw new ErrorResponse(404, 'Unread notifications not found');
    return unreadNotifications;
  } catch (error) {
    throw new ErrorResponse(500, 'Failed to fetch unread notifications');
  }
} 