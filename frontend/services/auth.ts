import apiFetch, { setTokens, clearTokens } from "@/utils/api";

export interface AuthUser {
  _id: string;
  email: string;
  fullName?: string;
  surveyCompleted?: boolean;
  [key: string]: any;
}

async function handleLoginResponse(res: { user: AuthUser; accessToken: string; refreshToken?: string }) {
  if (res.accessToken && res.refreshToken) {
    setTokens(res.accessToken, res.refreshToken);
  }
  return res.user;
}

export const authService = {
  async me(): Promise<AuthUser> {
    const response = await apiFetch<{ user: AuthUser }>("/api/auth/me", {
      method: "GET",
    });
    return response.data.user;
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const response = await apiFetch<{ user: AuthUser; accessToken: string; refreshToken?: string }>("/api/auth/login", {
      method: "POST",
      data: { email, password },
    });
    return handleLoginResponse(response.data);
  },

  async register(email: string, password: string, fullName?: string): Promise<AuthUser> {
    const response = await apiFetch<{ user: AuthUser; accessToken: string; refreshToken?: string }>("/api/auth/register", {
      method: "POST",
      data: { email, fullName, password },
    });
    return response.data.user;
  },

  async logout(): Promise<void> {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    try {
      await apiFetch<void>("/api/auth/logout", {
        method: "POST",
        data: stored ? { refreshToken: stored } : undefined,
      });
    } finally {
      clearTokens();
    }
  },

  async resendVerification(email?: string): Promise<void> {
    await apiFetch<void>("/api/auth/resend-verification", {
      method: "POST",
      data: email ? { email } : undefined,
    });
  },

  async forgotPassword(email: string): Promise<string | null> {
    const response = await apiFetch<{ token: string | null }>("/api/auth/forgot-password", {
      method: "POST",
      data: { email },
    });
    return response.data.token ?? null;
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiFetch<void>("/api/auth/reset-password", {
      method: "POST",
      data: { token, password },
    });
  },

  async updateProfile(fullName: string): Promise<AuthUser> {
    const response = await apiFetch<{ user: AuthUser }>("/api/auth/profile", {
      method: "PATCH",
      data: { fullName },
    });
    return response.data.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiFetch<void>("/api/auth/password", {
      method: "PATCH",
      data: { currentPassword, newPassword },
    });
  },

  async updateSettings(settings: { notificationPreferences?: Record<string, boolean> }): Promise<AuthUser> {
    const response = await apiFetch<{ user: AuthUser }>("/api/auth/settings", {
      method: "PATCH",
      data: settings,
    });
    return response.data.user;
  },

  async submitSurvey(data: { experienceLevel: string; referralSource: string; tradingGoals: string }): Promise<AuthUser> {
    const response = await apiFetch<{ user: AuthUser }>("/api/auth/survey", {
      method: "PATCH",
      data,
    });
    return response.data.user;
  },
};
