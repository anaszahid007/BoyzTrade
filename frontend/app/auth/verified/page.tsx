"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ShieldCheck, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifiedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen mt-24 flex flex-col items-center justify-center p-6 bg-bg-dark relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-10 z-10"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 border border-success/20 mb-4">
            <ShieldCheck className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Email <span className="text-success">Verified</span>
          </h1>
          <p className="text-muted-foreground">
            Your account has been successfully verified. You're now ready to start trading.
          </p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] space-y-6 border border-white/10 shadow-2xl text-center">
          <div className="flex items-center justify-center gap-3 p-4 bg-success/5 rounded-2xl border border-success/10 mb-2">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <span className="text-sm font-medium text-success text-center">Verification Successful</span>
          </div>

          <p className="text-sm text-muted-foreground">
            Welcome to the future of virtual trading. Your $2500 practice balance is waiting for you in the dashboard.
          </p>

          <Link href={user ? "/dashboard" : "/auth/login"} className="block w-full">
            <Button className="w-full text-lg shadow-lg shadow-success/10 group">
              {user ? "Go to Dashboard" : "Go to Login"}
              {user ? (
                <LayoutDashboard className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              ) : (
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help? <Link href="/faq" className="text-success hover:underline">Visit our Support Center</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
