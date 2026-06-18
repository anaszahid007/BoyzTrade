"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Settings,
  LogOut,
  TrendingUp,
  Star,
  Shield,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthActions } from "@/hooks/useAuthActions";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: Wallet },
  { name: "Trade", href: "/dashboard/trade", icon: ArrowLeftRight },
  { name: "Watchlist", href: "/dashboard/watchlist", icon: Star },
  { name: "History", href: "/dashboard/transactions", icon: TrendingUp },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

const secondaryNavItems = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface DashboardSidebarProps {
  isCollapsed: boolean;
  isSidebarOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ isCollapsed, isSidebarOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { logout } = useAuthActions();

  const visibleNavItems = [...navItems];
  if (user?.role === "admin") {
    visibleNavItems.push({ name: "Admin Panel", href: "/admin", icon: Shield });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 h-screen max-h-screen bg-card/80 backdrop-blur-xl border-r border-white/5 overflow-hidden transition-all duration-300 ease-in-out
        w-60 ${isCollapsed ? "lg:w-16" : "lg:w-60"}
        ${isSidebarOpen ? "translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:block" : "-translate-x-full lg:hidden"}
      `}>
        <div className="h-full min-h-0 flex flex-col p-3 overflow-hidden">
          {/* Logo Section */}
          <div className="flex items-center mb-8">
            <Link href="/dashboard" className={`flex items-center group transition-all ${isCollapsed ? 'justify-center w-full gap-0' : 'gap-2.5'}`}>
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                <img src="/images/logo.jpeg" alt="BoyzTrade" className="w-full h-full object-cover" />
              </div>
              <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                <span className="text-base font-bold tracking-tight leading-none whitespace-nowrap">Boyz<span className="text-primary">Trade</span></span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest mt-0.5 font-bold whitespace-nowrap">Terminal</span>
              </div>
            </Link>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 min-h-0 space-y-4 overflow-y-auto sidebar-scrollbar py-1">
            <nav className="space-y-0.5">
              <p className={`text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-3 mb-2 overflow-hidden transition-all duration-300 ${isCollapsed ? 'h-0 opacity-0 mb-0' : 'opacity-40 h-auto'}`}>Main Menu</p>
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                    className={`
                      group relative flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300
                      ${isActive
                          ? "bg-success/15 text-success border border-success/20"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"}
                    `}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center w-full gap-0' : 'gap-2.5'}`}>
                      <div className={`
                        p-1 rounded-lg transition-all duration-300
                        ${isActive ? "bg-success text-white" : "bg-white/5 text-muted-foreground group-hover:text-foreground"}
                      `}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`font-bold text-xs overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} ${isActive ? "translate-x-0.5" : ""}`}>{item.name}</span>
                    </div>
                    {isActive && !isCollapsed && (
                      <div className="w-1 h-2.5 rounded-full bg-success shadow-[0_0_10px_#3b82f6]" />
                    )}
                    {isActive && isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-success shadow-[0_0_10px_#3b82f6]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <nav className="space-y-0.5">
              <p className={`text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-3 mb-2 overflow-hidden transition-all duration-300 ${isCollapsed ? 'h-0 opacity-0 mb-0' : 'opacity-40 h-auto'}`}>Configuration</p>
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                    className={`
                      group flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300
                      ${isActive
                          ? "bg-primary/15 text-primary border border-primary/20"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"}
                    `}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center w-full gap-0' : 'gap-2.5'}`}>
                      <div className={`
                        p-1 rounded-lg transition-all duration-300
                        ${isActive ? "bg-primary text-white" : "bg-white/5 text-muted-foreground group-hover:text-foreground"}
                      `}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`font-bold text-xs overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="group p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all duration-300">
              <div className={`flex items-center ${isCollapsed ? 'justify-center gap-0' : 'gap-2.5'}`}>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-[9px] border-2 border-white/10 shadow-lg shrink-0">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className={`flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  <p className="text-[11px] font-bold truncate leading-none whitespace-nowrap">{user?.fullName || "Active Trader"}</p>
                  <p className="text-[8px] text-muted-foreground truncate opacity-70 mt-0.5 whitespace-nowrap">{user?.email}</p>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title={isCollapsed ? "Sign Out" : undefined}
              className={`flex items-center px-3 py-2 w-full rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger transition-all duration-300 group ${isCollapsed ? 'justify-center gap-0' : 'gap-2.5'}`}
            >
              <div className="p-1 bg-white/5 rounded-lg group-hover:bg-danger/20 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              <span className={`font-bold text-[11px] overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
