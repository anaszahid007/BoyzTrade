"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { FirebaseError } from "firebase/app";

export function useAuthActions() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
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
    setAuthLoading(true);
    setError(null);
    try {
      await authService.login(data.email, data.password);
      router.push("/dashboard");
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (data: any) => {
    setAuthLoading(true);
    setError(null);
    try {
      const result = await authService.register(data.email, data.password, data.name);
      if (result.user && !result.user.emailVerified) {
        router.push("/auth/verification-sent");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await authService.logout();
      router.push("/auth/login");
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await authService.signInWithGoogle();
      // Redirect flow will complete after Firebase redirects back to the app.
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    setResendLoading(true);
    setError(null);
    try {
      const { auth } = await import("@/lib/firebase");
      if (auth.currentUser) {
        await authService.sendVerificationEmail(auth.currentUser);
      }
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
    signInWithGoogle,
    resendVerificationEmail,
    authLoading,
    googleLoading,
    resendLoading,
    error,
    setError
  };
}
