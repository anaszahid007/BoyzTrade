"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";

export function useAuthActions() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = (err: unknown) => {
    console.error("Auth Error:", err);
    const message = (err as any)?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
    return "An unexpected error occurred. Please try again.";
  };

  const login = async (data: any) => {
    setAuthLoading(true);
    setError(null);
    try {
      const user = await authService.login(data.email, data.password);
      setUser(user);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.status === 403 && err.data?.requiresVerification) {
        // Redirect to verification page if email not verified
        const email = err.data.email || data.email;
        router.push(`/auth/verification-sent?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(handleAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (data: any) => {
    setAuthLoading(true);
    setError(null);
    try {
      const user = await authService.register(data.email, data.password, data.name);
      setUser(user);
      router.push("/dashboard");
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      router.push("/auth/login");
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const resendVerificationEmail = async (email?: string) => {
    setResendLoading(true);
    setError(null);
    try {
      await authService.resendVerification(email);
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setResendLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    resendVerificationEmail,
    authLoading,
    resendLoading,
    error,
    setError,
  };
}
