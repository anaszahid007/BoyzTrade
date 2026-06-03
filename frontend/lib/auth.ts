import apiFetch from "./api";

export interface AuthUser {
  _id: string;
  email: string;
  fullName?: string;
  [key: string]: any;
}

export const authService = {
  async me(): Promise<AuthUser> {
    const response = await apiFetch<{ user: AuthUser }>("/api/auth/me", {
      method: "GET",
    });
    return response.data.user;
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const response = await apiFetch<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      data: { email, password },
    });
    return response.data.user;
  },

  async register(email: string, password: string, fullName?: string): Promise<AuthUser> {
    const response = await apiFetch<{ user: AuthUser }>("/api/auth/register", {
      method: "POST",
      data: { email, fullName, password },
    });
    return response.data.user;
  },

  async logout(): Promise<void> {
    await apiFetch<void>("/api/auth/logout", {
      method: "POST",
    });
  },

  async refresh(): Promise<void> {
    await apiFetch<void>("/api/auth/refresh", {
      method: "POST",
    });
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
};
