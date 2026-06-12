"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/Button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, form.password);
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto border border-danger/20">
          <Lock className="w-10 h-10 text-danger" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Invalid Link</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This reset link is invalid or missing. Please request a new one.
          </p>
        </div>
        <Link href="/auth/forgot-password" className="block pt-4">
          <Button variant="secondary" className="w-full rounded-2xl py-6">
            Request New Link
          </Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-6 py-4"
      >
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto border border-success/20">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Password Reset!</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your password has been successfully updated. Redirecting to login...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
          New Password
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-success transition-colors" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-success transition-all text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
          Confirm Password
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-success transition-colors" />
          <input
            type="password"
            required
            minLength={8}
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-success transition-all text-sm"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-2xl text-lg font-bold shadow-lg shadow-success/10"
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          "Reset Password"
        )}
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/auth/login"
          className="text-sm font-medium text-muted-foreground hover:text-success flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Login
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mt-26 max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Set new <span className="text-success">Password</span></h1>
          <p className="text-muted-foreground">Must be at least 8 characters.</p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center mt-10 text-[12px] text-muted-foreground">
          &copy; 2026 Boyz Trade | Built for the next generation.
        </p>
      </motion.div>
    </div>
  );
}
