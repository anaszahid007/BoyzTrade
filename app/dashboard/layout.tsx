"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  Settings, 
  LogOut, 
  TrendingUp,
  Menu,
  X
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: Wallet },
  { name: "Trade", href: "/dashboard/trade", icon: ArrowLeftRight },
  { name: "History", href: "/dashboard/transactions", icon: TrendingUp },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg-dark text-foreground flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="p-2 bg-primary/10 rounded-xl neon-glow-blue border border-primary/20">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">Boyz<span className="text-primary">Trade</span></span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-primary/10 text-primary border border-primary/20 neon-glow-blue" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-border space-y-4">
            <div className="px-4 py-3 bg-secondary/30 rounded-xl border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Authenticated as</p>
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-danger/10 hover:text-danger transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border flex items-center justify-between px-6 lg:px-10">
          <button 
            className="p-2 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4">
             {/* Header Content like Notifications or Profile can go here */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
