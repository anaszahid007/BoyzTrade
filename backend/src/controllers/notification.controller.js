import * as notificationService from '../services/notification.service.js';
import Response from '../utils/Response.js';
import ErrorResponse from '../utils/ErrorResponse.js';


export async function unreadList(req, res) {
  try {
    const result = await notificationService.getUserUnreadNotifications(req.user._id);
    return Response.success(res, result, 'Unread notifications fetched successfully');
  } catch (error) {
    throw new ErrorResponse(404, 'Notifications not found');
  }
}

export async function listNotifications(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const result = await notificationService.getUserNotifications(req.user._id, page, perPage);
    if (!result) throw new ErrorResponse(404, 'Notifications not found');
    return Response.success(res, result, 'Notifications fetched successfully');
  } catch (error) {
    throw new ErrorResponse(500, 'Failed to fetch notifications');
  }
}

export async function markRead(req, res) {
  try {
    await notificationService.markAsRead(req.user._id, req.params.id);
    return Response.success(res, 'Marked as read', 'Notification marked as read successfully');
  } catch (error) {
    throw new ErrorResponse(404, 'Notification not found');
  }
}

export async function markAllRead(req, res) {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    if (!result) throw new ErrorResponse(404, 'Failed to mark all notifications as read');
    return Response.success(res, result, 'All notifications marked as read successfully');
  } catch (error) {
    throw new ErrorResponse(500, 'Failed to mark all notifications as read');
  }
}

export async function unreadCount(req, res) {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    if (!count) throw new ErrorResponse(404, 'Unread count not found');
    return Response.success(res, { count }, 'Unread count fetched successfully');
  } catch (error) {
    throw new ErrorResponse(500, 'Failed to fetch unread count');
  }
}
