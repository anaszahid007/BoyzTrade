"use client"

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { authService, AuthUser } from "@/services/auth";
import { setTokens, clearTokens } from "@/utils/api";

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = (user: AuthUser | null) => {
    setUser(user);
    if (!user) clearTokens();
  };

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (!stored) {
        if (isMounted) { setUser(null); setLoading(false); }
        return;
      }

      try {
        const currentUser = await authService.me();
        if (isMounted) setUser(currentUser);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUser();

    return () => { isMounted = false; };
  }, []);

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
    await authService.logout();
  }

  const value = { user, loading, logout, refreshUser, setUser: syncUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
