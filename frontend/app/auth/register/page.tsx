"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, ArrowLeft, User, TrendingUp, BarChart3, Users, Shield, Rocket, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useState } from "react";

const chartPath = "M0,80 C20,80 30,40 60,40 C90,40 100,60 130,60 C160,60 170,30 200,30 C230,30 240,50 270,50 C300,50 310,20 340,20 C370,20 380,35 400,35";

const perks = [
  { icon: TrendingUp, title: "$2500 Virtual Funds", desc: "Start trading with risk-free virtual capital." },
  { icon: BarChart3, title: "Real Market Data", desc: "Live prices powered by real-time market feeds." },
  { icon: Users, title: "Community Driven", desc: "Join thousands of traders mastering the market." },
  { icon: Shield, title: "Zero Risk", desc: "Practice strategies without losing real money." },
];

export default function RegisterPage() {
  const { register: registerAction, authLoading, error, setError } = useAuthActions();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch("password");

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    await registerAction(data);
  };

  return (
    <div className="min-h-screen flex bg-bg-dark">
      {/* Left - Form Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-success/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md z-10"
        >
          {/* Logo */}
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
                <img src="/images/boyztrade-logo.jpg" alt="BoyzTrade" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-bold tracking-tight">Boyz<span className="text-success">Trade</span></span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
              Create Your <span className="text-success">Account</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Start with $2500 in virtual funds — no risk, no credit card.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {(error || Object.keys(errors).length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm text-center"
                >
                  {error || (errors.name?.message as string) || (errors.email?.message as string) || (errors.password?.message as string) || (errors.confirmPassword?.message as string)}
                </motion.div>
              )}

              <Input
                label="Full Name"
                type="text"
                icon={User}
                placeholder="John Doe"
                error={errors.name?.message as string}
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters"
                  }
                })}
              />

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="name@example.com"
                error={errors.email?.message as string}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />

              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                icon={Lock}
                placeholder="Min 8 chars"
                error={errors.password?.message as string}
                rightNode={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Min 8 characters"
                  }
                })}
              />

              <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                icon={Lock}
                placeholder="Repeat password"
                error={errors.confirmPassword?.message as string}
                rightNode={
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match"
                })}
              />

              <Button
                type="submit"
                isLoading={authLoading}
                className="w-full py-3.5 text-base shadow-lg shadow-success/10"
              >
                Create Account
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/auth/login" className="text-success hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </form>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-success inline-flex items-center gap-2 transition-colors group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right - Visual Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-success/[0.08] via-transparent to-primary/[0.04] relative overflow-hidden items-center justify-center p-12">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-success/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 w-full max-w-lg space-y-12"
        >
          {/* Badge + Heading */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full text-success text-[10px] font-bold uppercase tracking-wider">
              <Rocket className="w-3 h-3" />
              Start Free, No Risk
            </div>
            <h2 className="text-3xl font-bold tracking-tight leading-tight">
              Begin Your Trading<br />
              <span className="text-success">Journey Today</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Join thousands of traders mastering the crypto markets without risking a single dollar.
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-3">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center text-success shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{perk.title}</p>
                    <p className="text-[11px] text-muted-foreground">{perk.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Animated Chart */}
          <div className="relative">
            <div className="absolute -inset-4 bg-success/5 blur-2xl rounded-3xl" />
            <div className="relative bg-card/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-bold text-muted-foreground">ETH/USD Live</span>
                </div>
                <div className="flex items-center gap-1.5 text-success text-xs font-bold">
                  <TrendingUp className="w-3 h-3" />
                  +8.7%
                </div>
              </div>
              <svg viewBox="0 0 400 100" className="w-full h-auto">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={chartPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="[stroke-dasharray:800] [stroke-dashoffset:800] animate-[draw_2s_ease-out_forwards]" />
                <path d={`${chartPath} L400,100 L0,100 Z`} fill="url(#chartGrad)" opacity="0.4" />
              </svg>
              <style jsx>{`
                @keyframes draw {
                  to { stroke-dashoffset: 0; }
                }
              `}</style>
              <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground font-mono">
                <span>07:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-success" />
              Secure Platform
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-success" />
              Real Market Data
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3 text-success" />
              $10K Virtual Funds
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
