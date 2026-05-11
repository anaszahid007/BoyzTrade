"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { FirebaseError } from "firebase/app";

export function useAuthActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = (err: unknown) => {
    console.error("Auth Error:", err);
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case "auth/email-already-in-use":
          return "This email is already registered.";
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          return "Invalid email or password.";
        case "auth/weak-password":
          return "Password should be at least 6 characters.";
        case "auth/user-disabled":
          return "This account has been disabled.";
        default:
          return "An error occurred. Please try again.";
      }
    }
    return "An unexpected error occurred.";
  };

  const login = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login(data.email, data.password);
      router.push("/dashboard");
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(data.email, data.password);
      router.push("/dashboard");
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      router.push("/auth/login");
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    loading,
    error,
    setError
  };
}
