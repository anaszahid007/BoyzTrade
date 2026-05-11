"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TrendingUp, Mail, Lock, UserPlus, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else {
        setError("An error occurred during registration. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-dark relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-success/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-10 z-10"
      >
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="p-3 bg-success/10 rounded-2xl border border-success/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
            <span className="text-3xl font-bold tracking-tight">Boyz<span className="text-success">Trade</span></span>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">
            Create your <span className="text-success">Account</span>
          </h1>
          <p className="text-muted-foreground">
            Start your virtual trading journey with $10,000 risk-free.
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="glass p-8 rounded-[2.5rem] space-y-6 border border-white/10 shadow-2xl"
        >
          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
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

            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
               <div className="relative group">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-success transition-colors" />
                 <input 
                   type="password" 
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="At least 8 characters"
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-success transition-all text-sm"
                 />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</label>
               <div className="relative group">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-success transition-colors" />
                 <input 
                   type="password" 
                   required
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   placeholder="Repeat password"
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-success transition-all text-sm"
                 />
               </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-lg rounded-2xl font-bold shadow-lg shadow-success/10"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Get Started Now"}
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-success hover:underline font-bold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>

        <div className="text-center">
           <Link href="/" className="text-sm text-muted-foreground hover:text-success flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
           </Link>
        </div>
      </motion.div>
    </div>
  );
}
