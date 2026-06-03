"use client"

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService, AuthUser } from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const currentUser = await authService.me();
        if (isMounted) setUser(currentUser);
      } catch (error) {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle protected path changes
  useEffect(() => {
    const isProtectedPath = pathname?.startsWith("/dashboard") || 
                            pathname?.startsWith("/auth/verification-sent") ||
                            pathname?.startsWith("/auth/verified");

    // Only attempt refresh if we don't have a user and we're not already loading.
    // We should also check if we've already tried and failed to avoid loops.
    // However, a simpler approach is to rely on the initial load and only
    // trigger a refresh when explicitly needed.
    
    // For now, let's just ensure we don't loop by removing the automatic refresh
    // on every path change if it's already failed.
  }, [pathname]);

  async function refreshUser() {
    setLoading(true);
    try {
      const currentUser = await authService.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await authService.logout();
      setUser(null);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  const value = { user, loading, logout, refreshUser, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};