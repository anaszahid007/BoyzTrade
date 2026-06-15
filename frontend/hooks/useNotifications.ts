"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { notificationService, NotificationItem } from "@/services/notification";

export function useNotifications() {
  const { socket } = useSocket();
  const [unreadNotifications, setUnreadNotifications] = useState<NotificationItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await notificationService.list(1, 20);
      setNotifications(result.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadList = useCallback(async () => {
    try {
      const result = await notificationService.getUnreadList();
      setUnreadNotifications(result || []);
    } catch {
      // silent
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchNotifications();
    fetchUnreadCount();
    fetchUnreadList();
  }, [fetchNotifications, fetchUnreadCount, fetchUnreadList]);

  // Listen for external updates (e.g. from notifications page)
  useEffect(() => {
    const handleExternalMarkAllRead = () => {
      setNotifications((prev) => (Array.isArray(prev) ? prev.map((n) => ({ ...n, isRead: true })) : []));
      setUnreadCount(0);
      setUnreadNotifications([]);
    };
    const handleExternalMarkRead = (e: CustomEvent) => {
      const id = e.detail;
      if (!id) return;
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)) : []
      );
      setUnreadCount((prev) => Math.max(0, (typeof prev === 'number' ? prev : 0) - 1));
      setUnreadNotifications((prev) =>
        Array.isArray(prev) ? prev.filter((n) => n._id !== id) : []
      );
    };
    window.addEventListener("notifications-mark-all-read", handleExternalMarkAllRead);
    window.addEventListener("notifications-mark-read", handleExternalMarkRead as EventListener);
    return () => {
      window.removeEventListener("notifications-mark-all-read", handleExternalMarkAllRead);
      window.removeEventListener("notifications-mark-read", handleExternalMarkRead as EventListener);
    };
  }, []);

  // Listen for real-time pushes
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: NotificationItem) => {
      if (!notification || typeof notification !== 'object') return;
      setNotifications((prev) => {
        if (!Array.isArray(prev)) return [notification];
        return [notification, ...prev];
      });
      setUnreadCount((prev) => (typeof prev === 'number' ? prev + 1 : 1));
      setUnreadNotifications((prev) => {
        if (!Array.isArray(prev)) return [notification];
        return [notification, ...prev];
      });
    };

    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setUnreadNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      // silent
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setUnreadNotifications([]);
    } catch {
      // silent
    }
  }, []);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
