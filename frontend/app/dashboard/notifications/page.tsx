"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Megaphone,
  AlertTriangle,
  TrendingUp,
  Info,
  Calendar,
  ArrowRight,
  RefreshCw,
  MailOpen,
} from "lucide-react";
import { notificationService, NotificationItem } from "@/services/notification";
import { Button } from "@/components/ui/Button";

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  TRADE: { icon: TrendingUp, label: "Trade", color: "text-success bg-success/10 border-success/20" },
  ALERT: { icon: AlertTriangle, label: "Alert", color: "text-warning bg-warning/10 border-warning/20" },
  SYSTEM: { icon: Info, label: "System", color: "text-primary bg-primary/10 border-primary/20" },
  MARKET: { icon: Megaphone, label: "Market", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
};

const typeIcon = (type: string) => {
  const cfg = typeConfig[type] || typeConfig.SYSTEM;
  const Icon = cfg.icon;
  return <Icon className="w-3 h-3" />;
};

const typeLabel = (type: string) => {
  const cfg = typeConfig[type] || typeConfig.SYSTEM;
  return cfg.label;
};

const typeColor = (type: string) => {
  const cfg = typeConfig[type] || typeConfig.SYSTEM;
  return cfg.color;
};

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);
  const perPage = 20;

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await notificationService.list(p, perPage);
      setNotifications(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      window.dispatchEvent(new CustomEvent("notifications-mark-read", { detail: id }));
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(new CustomEvent("notifications-mark-all-read"));
    } catch {
      // silent
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-5"
    >
      {/* Header */}
      <motion.div variants={itemAnim} className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Bell className="w-3.5 h-3.5 text-primary" />
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Inbox</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Notifications{unreadCount > 0 && (
              <span className="ml-2 text-[13px] font-bold text-success align-middle">
                ({unreadCount} unread)
              </span>
            )}
          </h1>
          <p className="text-[11px] text-muted-foreground">Stay updated on trades, alerts, and platform activity.</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              onClick={handleMarkAllRead}
              isLoading={markingAll}
              className="px-3 h-8 rounded-lg border-white/5 text-[10px] font-bold"
            >
              <CheckCheck className="w-3 h-3 mr-1.5" />
              Mark All Read
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => fetchPage(page)}
            className="px-2 h-8 rounded-lg text-[10px]"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </motion.div>

      {/* List */}
      <motion.div variants={itemAnim} className="glass rounded-xl border border-white/5 overflow-hidden shadow-lg">
        {loading && notifications.length === 0 ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse px-5 py-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                  <div className="h-2.5 bg-white/5 rounded w-full" />
                  <div className="h-2 bg-white/5 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-white/5">
            {notifications.map((n) => {
              const isUnread = !n.isRead;
              return (
                <motion.div
                  key={n._id}
                  variants={itemAnim}
                  className={`group relative flex items-start gap-3.5 px-5 py-4 transition-all duration-200 cursor-pointer hover:bg-white/[0.02] ${
                    isUnread ? "bg-success/[0.02] border-l-2 border-l-success" : "border-l-2 border-l-transparent"
                  }`}
                  onClick={() => { if (isUnread) handleMarkRead(n._id); }}
                >
                  {/* Type icon */}
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${typeColor(n.type)}`}>
                    {typeIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-xs font-bold leading-tight ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </span>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                        )}
                      </div>
                      <span className="shrink-0 text-[9px] text-muted-foreground/50 font-medium whitespace-nowrap">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>

                    <p className={`text-[11px] mt-1 leading-relaxed line-clamp-2 ${isUnread ? "text-muted-foreground/90" : "text-muted-foreground/60"}`}>
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2.5 mt-2">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${typeColor(n.type)}`}>
                        {typeIcon(n.type)}
                        {typeLabel(n.type)}
                      </span>
                      <span className="text-[9px] text-muted-foreground/40 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(n.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Mark read action */}
                  {isUnread && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }}
                      className="shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 hover:bg-success/20 text-muted-foreground hover:text-success"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <MailOpen className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm font-bold text-muted-foreground">All caught up</h3>
            <p className="text-[11px] text-muted-foreground/50 mt-1 max-w-xs mx-auto">
              No notifications yet. They&apos;ll appear here when you execute trades or receive alerts.
            </p>
          </div>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/[0.01]">
            <p className="text-[9px] text-muted-foreground/40">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
