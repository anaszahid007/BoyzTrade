"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAuth } from "@/contexts/AuthContext";

function VerificationContent() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const displayEmail = user?.email || emailParam;

  const { resendVerificationEmail, resendLoading } = useAuthActions();
  const [canResend, setCanResend] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user?.isVerified) {
      router.push("/auth/verified");
    }
  }, [user, router]);

  // Auto-refresh verification status every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !user.isVerified) {
        refreshUser();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user, refreshUser]);

  useEffect(() => {
    const timer = setTimeout(() => setCanResend(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleResend = async () => {
    if (!canResend) return;
    setResendStatus(null);
    await resendVerificationEmail(displayEmail || undefined);
    setResendStatus("Verification email sent successfully!");
    setCanResend(false);
    setTimeout(() => setCanResend(true), 30000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-dark relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-10 z-10"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 border border-success/20 mb-4">
            <Mail className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Check your <span className="text-success">Email</span>
          </h1>
          <p className="text-muted-foreground">
            We've sent a verification link to{" "}
            <span className="text-foreground font-medium">{displayEmail}</span>
          </p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] space-y-6 border border-white/10 shadow-2xl">
          <div className="flex items-start gap-4 p-4 bg-success/5 rounded-2xl border border-success/10">
            <CheckCircle2 className="w-6 h-6 text-success mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-success">Next Steps</p>
              <p className="text-xs text-muted-foreground">
                Click the link in the email to verify your account. The link will expire in 24 hours.
              </p>
            </div>
          </div>

          {resendStatus && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-2xl text-success text-sm text-center">
              {resendStatus}
            </div>
          )}

          <Button
            onClick={handleResend}
            disabled={!canResend || resendLoading}
            isLoading={resendLoading}
            variant="secondary"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {canResend ? "Resend Verification Email" : "Wait 30s to resend"}
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?{" "}
              <button
                onClick={handleResend}
                disabled={!canResend || resendLoading}
                className="text-success hover:underline font-bold disabled:opacity-50"
              >
                Click to resend
              </button>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-success flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerificationSentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationContent />
    </Suspense>
  );
}
