"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, ArrowLeft, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthActions } from "@/hooks/useAuthActions";

export default function RegisterPage() {
  const { register: registerAction, signInWithGoogle, authLoading, googleLoading, error, setError } = useAuthActions();
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
        className="w-full mt-26 max-w-md space-y-10 z-10"
      >
        <div className="text-center space-y-4">
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
              {error || (errors.name?.message as string) || (errors.email?.message as string) || (errors.password?.message as string) || (errors.confirmPassword?.message as string)}
            </div>
          )}

          <div className="space-y-4">
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
              type="password"
              label="Password"
              icon={Lock}
              placeholder="At least 8 characters"
              error={errors.password?.message as string}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              })}
            />

            <Input
              type="password"
              label="Confirm Password"
              icon={Lock}
              placeholder="Repeat password"
              error={errors.confirmPassword?.message as string}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: value => value === password || "Passwords do not match"
              })}
            />
          </div>

          <Button
            type="submit"
            isLoading={authLoading}
            className="w-full text-lg shadow-lg shadow-success/10"
          >
            Sign Up
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-bg-dark px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={signInWithGoogle}
            isLoading={googleLoading}
            className="w-full text-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg>
            Sign up with Google
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
