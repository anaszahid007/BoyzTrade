"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TrendingUp, Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An error occurred during sign in.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-bg-dark relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 neon-glow-blue border border-primary/20">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome <span className="gradient-text">Back</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Ready to resume your virtual trading session?
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="glass p-8 rounded-3xl space-y-6 border border-white/5 shadow-2xl"
        >
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full py-4 text-lg"
            isLoading={loading}
          >
            <LogIn className="w-5 h-5" />
            Sign In to Terminal
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              New to Boyz Trade?{" "}
              <Link
                href="/auth/register"
                className="text-primary hover:underline font-medium"
              >
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
