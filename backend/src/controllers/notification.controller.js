import * as notificationService from '../services/notification.service.js';

export async function listNotifications(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const result = await notificationService.getUserNotifications(req.user._id, page, perPage);
    return res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function markRead(req, res) {
  try {
    await notificationService.markAsRead(req.user._id, req.params.id);
    return res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    const status = error.message === 'Notification not found' ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

export async function markAllRead(req, res) {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    return res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function unreadCount(req, res) {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    return res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
