"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (!loading && user && !user.isVerified) {
      router.push("/auth/verification-sent");
    } else if (!loading && user && user.isVerified && !user.surveyCompleted) {
      router.push("/auth/survey");
    } else if (!loading && user && user.isVerified && user.surveyCompleted) {
      if (user.role === 'admin' && !pathname.startsWith('/admin')) {
        router.push('/admin');
      } else if (user.role === 'instructor' && !pathname.startsWith('/instructor')) {
        router.push('/instructor');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !user.isVerified || !user.surveyCompleted) {
    return null;
  }

  return <>{children}</>;
}
