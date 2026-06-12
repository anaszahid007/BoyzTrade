"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = await authService.forgotPassword(email);
      if (token) {
        router.push(`/auth/reset-password?token=${encodeURIComponent(token)}`);
      } else {
        setIsSent(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please check the address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mt-26 max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Reset your <span className="text-success">Password</span></h1>
          <p className="text-muted-foreground">Enter your email and we'll send you reset instructions.</p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          {isSent ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-6 py-4"
            >
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto border border-success/20">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Check your Inbox</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We've sent reset instructions to <br />
                  <span className="text-foreground font-bold">{email}</span>
                </p>
              </div>
              <Link href="/auth/login" className="block pt-4">
                <Button variant="secondary" className="w-full rounded-2xl py-6">
                  Back to Login
                </Button>
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-success transition-colors" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
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
                  "Send Reset Link"
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
          )}
        </div>

        <p className="text-center mt-10 text-[12px] text-muted-foreground">
          &copy; 2026 Boyz Trade | Built for the next generation.
        </p>
      </motion.div>
    </div>
  );
}
