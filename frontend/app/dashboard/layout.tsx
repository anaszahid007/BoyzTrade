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
  Bell,
  Search,
  User as UserIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: Wallet },
  { name: "Trade", href: "/dashboard/trade", icon: ArrowLeftRight },
  { name: "History", href: "/dashboard/transactions", icon: TrendingUp },
];

const secondaryNavItems = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { portfolio } = usePortfolio();
  const { logout } = useAuthActions();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeItem = [...navItems, ...secondaryNavItems].find(item => item.href === pathname);

  return (
    <ProtectedRoute>
      <div className="h-screen bg-bg-dark text-foreground flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 h-screen max-h-screen bg-card/80 backdrop-blur-xl border-r border-white/5 transition-transform duration-500 ease-in-out overflow-hidden
        ${isSidebarOpen ? "translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:block" : "-translate-x-full lg:hidden"}
      `}>
        <div className="h-full min-h-0 flex flex-col p-4 overflow-hidden">
          {/* Logo Section */}
          <div className="flex items-center justify-between gap-2.5 px-2 mb-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group transition-all">
            <div className="p-2 bg-primary/10 rounded-xl neon-glow-blue border border-primary/20 group-hover:scale-105 transition-transform duration-300">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none">Boyz<span className="text-primary">Trade</span></span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5 font-bold">Terminal</span>
            </div>
          </Link>
        
          </div>

          {/* Navigation Section */}
          <div className="flex-1 min-h-0 space-y-6 overflow-y-auto sidebar-scrollbar py-1">
            <nav className="space-y-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-4 mb-3 opacity-40">Main Menu</p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      group relative flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300
                      ${isActive 
                        ? "bg-primary/15 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] border border-primary/20" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-1 rounded-lg transition-all duration-300
                        ${isActive ? "bg-primary text-white shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" : "bg-white/5 text-muted-foreground group-hover:text-foreground"}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`font-bold text-xs transition-all ${isActive ? "translate-x-0.5" : ""}`}>{item.name}</span>
                    </div>
                    {isActive && (
                      <div className="w-1 h-3 rounded-full bg-success shadow-[0_0_10px_#3b82f6]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <nav className="space-y-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-4 mb-3 opacity-40">Configuration</p>
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      group flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300
                      ${isActive 
                        ? "bg-primary/15 text-primary border border-primary/20" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-1 rounded-lg transition-all duration-300
                        ${isActive ? "bg-primary text-white" : "bg-white/5 text-muted-foreground group-hover:text-foreground"}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="group p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-[10px] border-2 border-white/10 shadow-lg">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-bold truncate leading-none">{user?.fullName || "Active Trader"}</p>
                  <p className="text-[9px] text-muted-foreground truncate opacity-70 mt-1">{user?.email}</p>
                </div>
              </div>
              <div className="h-[1px] bg-white/5 my-2" />
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground font-medium">Balance</span>
                <span className="text-success font-mono font-bold">${portfolio?.cash_balance?.toLocaleString() || "0.00"}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-danger/10 hover:text-danger transition-all duration-300 group"
            >
              <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-danger/20 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
        {/* Background Glows for Main Content */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 backdrop-blur-md bg-bg-dark/50 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex flex-col">
              <h2 className="text-sm font-bold tracking-tight">{activeItem?.name || "Dashboard"}</h2>
              <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                <span>Platform</span>
                <ChevronRight className="w-2.5 h-2.5 opacity-50" />
                <span className="text-primary/80">{activeItem?.name || "Overview"}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/5 rounded-xl text-xs w-56 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
              />
            </div>
            
            <button className="relative p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
              <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full border-2 border-bg-dark" />
            </button>

            <div className="h-8 w-[1px] bg-white/5 mx-0.5 hidden sm:block" />

            <div className="flex items-center gap-2.5 p-1 pr-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group hidden sm:flex">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary transition-transform group-hover:scale-105">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">Profile</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto sidebar-scrollbar p-6 lg:p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
