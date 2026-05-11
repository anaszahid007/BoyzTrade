"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TrendingUp, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthActions } from "@/hooks/useAuthActions";

export default function RegisterPage() {
  const { register: registerAction, loading, error, setError } = useAuthActions();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const password = watch("password");

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    await registerAction(data);
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
          onSubmit={handleSubmit(onSubmit)}
          className="glass p-8 rounded-[2.5rem] space-y-6 border border-white/10 shadow-2xl"
        >
          {(error || Object.keys(errors).length > 0) && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-sm text-center">
              {error || (errors.email?.message as string) || (errors.password?.message as string) || (errors.confirmPassword?.message as string)}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
               <div className="relative group">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-success transition-colors" />
                 <input 
                   type="email" 
                   {...register("email", { 
                     required: "Email is required",
                     pattern: {
                       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                       message: "Invalid email address"
                     }
                   })}
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
                   {...register("password", { 
                     required: "Password is required",
                     minLength: {
                       value: 8,
                       message: "Password must be at least 8 characters"
                     }
                   })}
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
                   {...register("confirmPassword", { 
                     required: "Please confirm your password",
                     validate: value => value === password || "Passwords do not match"
                   })}
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
