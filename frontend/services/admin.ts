import apiFetch, { ApiResponse } from "@/utils/api";

export interface AdminStats {
  totalUsers: number;
  totalPortfolioValue: number;
  totalTrades: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
  };
  totalAssets: number;
  totalTransactions: number;
}

export interface AdminUser {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  portfolio: {
    totalBalance: number;
    totalProfitLoss: number;
    totalAssets: number;
  };
}

export interface AdminTrade {
  _id: string;
  userId: {
    _id: string;
    email: string;
    fullName: string;
  } | null;
  assetId: {
    _id: string;
    symbol: string;
    name: string;
    logo?: string;
  } | null;
  tradeType: "BUY" | "SELL";
  quantity: number;
  price: number;
  totalAmount: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
  createdAt: string;
}

export interface AdminAsset {
  _id: string;
  assetId: string;
  symbol: string;
  name: string;
  marketType: string;
  currentPrice: number;
  logo?: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminService = {
  async getStats(): Promise<ApiResponse<AdminStats>> {
    return apiFetch<AdminStats>("/api/admin/stats", { method: "GET" });
  },

  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isVerified?: string;
  } = {}): Promise<ApiResponse<AdminUser[]>> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);
    if (params.role) query.append("role", params.role);
    if (params.isVerified) query.append("isVerified", params.isVerified);

    return apiFetch<AdminUser[]>(`/api/admin/users?${query.toString()}`, { method: "GET" });
  },

  async getUser(userId: string): Promise<ApiResponse<{
    user: Omit<AdminUser, "portfolio">;
    portfolio: {
      cash_balance: number;
      total_invested_value: number;
      total_portfolio_value: number;
      total_profit_loss: number;
      total_profit_loss_percentage: string;
      holdings: Array<{
        symbol: string;
        name: string;
        quantity: number;
        avg_buy_price: number;
        current_price: number;
        current_value: number;
        profit_loss: number;
        profit_loss_percentage: string;
      }>;
    };
    recentTrades: any[];
    recentTransactions: any[];
  }>> {
    return apiFetch<any>(`/api/admin/users/${userId}`, { method: "GET" });
  },

  async updateUserRole(userId: string, role: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      data: { role },
    });
  },

  async toggleUserVerification(userId: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/api/admin/users/${userId}/verify`, {
      method: "PATCH",
    });
  },

  async adjustUserBalance(userId: string, amount: number, description?: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/api/admin/users/${userId}/balance`, {
      method: "PATCH",
      data: { amount, description },
    });
  },

  async deleteUser(userId: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
  },

  async getTrades(params: {
    page?: number;
    limit?: number;
    symbol?: string;
    type?: string;
    status?: string;
    userId?: string;
  } = {}): Promise<ApiResponse<AdminTrade[]>> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.symbol) query.append("symbol", params.symbol);
    if (params.type) query.append("type", params.type);
    if (params.status) query.append("status", params.status);
    if (params.userId) query.append("userId", params.userId);

    return apiFetch<AdminTrade[]>(`/api/admin/trades?${query.toString()}`, { method: "GET" });
  },

  async getAssets(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<ApiResponse<AdminAsset[]>> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);

    return apiFetch<AdminAsset[]>(`/api/admin/assets?${query.toString()}`, { method: "GET" });
  },

  async createAsset(asset: Omit<AdminAsset, "_id" | "createdAt">): Promise<ApiResponse<AdminAsset>> {
    return apiFetch<AdminAsset>("/api/admin/assets", {
      method: "POST",
      data: asset,
    });
  },

  async updateAsset(assetId: string, updateData: Partial<AdminAsset>): Promise<ApiResponse<AdminAsset>> {
    return apiFetch<AdminAsset>(`/api/admin/assets/${assetId}`, {
      method: "PATCH",
      data: updateData,
    });
  },

  async deleteAsset(assetId: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/api/admin/assets/${assetId}`, {
      method: "DELETE",
    });
  },

  async broadcastMessage(title: string, message: string, type: string = "SYSTEM"): Promise<ApiResponse<any>> {
    return apiFetch<any>("/api/admin/broadcast", {
      method: "POST",
      data: { title, message, type },
    });
  },
};
