import apiFetch from "@/utils/api";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "TRADE" | "SYSTEM" | "ALERT" | "MARKET";
  isRead: boolean;
  createdAt: string;
  meta?: Record<string, any>;
}

export interface NotificationsResponse {
  success: boolean;
  data: NotificationItem[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export const notificationService = {
  async list(page = 1, perPage = 20): Promise<NotificationsResponse> {
    const response = await apiFetch<NotificationsResponse>(
      `/api/notifications?page=${page}&perPage=${perPage}`,
      { method: "GET" }
    );
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiFetch<{ count: number }>(
      "/api/notifications/unread-count",
      { method: "GET" }
    );
    return response.data.count;
  },

  async markRead(id: string): Promise<void> {
    await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  },

  async markAllRead(): Promise<void> {
    await apiFetch("/api/notifications/read-all", { method: "PATCH" });
  },
};
