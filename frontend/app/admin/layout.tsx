"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Database,
  History,
  Megaphone,
  ArrowLeft,
  LogOut,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  User as UserIcon,
  Award,
  Zap,
} from "lucide-react";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users Directory", href: "/admin/users", icon: Users },
  { name: "Asset Catalog", href: "/admin/assets", icon: Database },
  { name: "Global Trade Log", href: "/admin/trades", icon: History },
  { name: "Badge Manager", href: "/admin/badges", icon: Award },
  { name: "Quest Manager", href: "/admin/quests", icon: Zap },
  { name: "Broadcast Center", href: "/admin/broadcast", icon: Megaphone },
];

const secondaryNavItems = [
  { name: "Back to Terminal", href: "/dashboard", icon: ArrowLeft },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_sidebar_collapsed");
      return stored === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("admin_sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const activeItem = [...navItems, ...secondaryNavItems].find(item => 
    pathname === item.href || (item.href !== "/admin" && item.href !== "/dashboard" && pathname?.startsWith(item.href))
  );

  return (
    <AdminProtectedRoute>
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
          fixed inset-y-0 left-0 z-50 h-screen max-h-screen bg-card/85 backdrop-blur-xl border-r border-white/5 overflow-hidden transition-all duration-300 ease-in-out
          w-60 ${isCollapsed ? "lg:w-16" : "lg:w-60"}
          ${isSidebarOpen ? "translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:block" : "-translate-x-full lg:hidden"}
        `}>
          <div className="h-full min-h-0 flex flex-col p-3 overflow-hidden">
            {/* Logo Section */}
            <div className="flex items-center mb-8">
              <Link href="/admin" className={`flex items-center group transition-all ${isCollapsed ? 'justify-center w-full gap-0' : 'gap-2.5'}`}>
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                  <img src="/images/logo.jpeg" alt="BoyzTrade" className="w-full h-full object-cover" />
                </div>
                <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  <span className="text-base font-bold tracking-tight leading-none whitespace-nowrap">Boyz<span className="text-success">Admin</span></span>
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest mt-0.5 font-bold whitespace-nowrap">Control Panel</span>
                </div>
              </Link>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto sidebar-scrollbar py-1">
              <nav className="space-y-0.5">
                <p className={`text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-3 mb-2 overflow-hidden transition-all duration-300 ${isCollapsed ? 'h-0 opacity-0 mb-0' : 'opacity-40 h-auto'}`}>Administration</p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={isCollapsed ? item.name : undefined}
                      onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
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
                        <div className="w-1 h-2.5 rounded-full bg-success shadow-[0_0_10px_#10b981]" />
                      )}
                      {isActive && isCollapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-success shadow-[0_0_10px_#10b981]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <nav className="space-y-0.5">
                <p className={`text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-3 mb-2 overflow-hidden transition-all duration-300 ${isCollapsed ? 'h-0 opacity-0 mb-0' : 'opacity-40 h-auto'}`}>Exit</p>
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={isCollapsed ? item.name : undefined}
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
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center text-white font-bold text-[9px] border-2 border-white/10 shadow-lg shrink-0">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className={`flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    <p className="text-[11px] font-bold truncate leading-none whitespace-nowrap">{user?.fullName || "Admin Console"}</p>
                    <p className="text-[8px] text-muted-foreground truncate opacity-70 mt-0.5 whitespace-nowrap">Admin Profile</p>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title={isCollapsed ? "Sign Out" : undefined}
                className={`flex items-center px-3 py-2 w-full rounded-lg text-muted-foreground hover:bg-success/10 hover:text-success transition-all duration-300 group ${isCollapsed ? 'justify-center gap-0' : 'gap-2.5'}`}
              >
                <div className="p-1 bg-white/5 rounded-lg group-hover:bg-success/20 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </div>
                <span className={`font-bold text-[11px] overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-success/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <header className="h-12 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 backdrop-blur-md bg-bg-dark/50 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <button
                className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => {
                  if (window.innerWidth >= 1024) {
                    setIsCollapsed(prev => !prev);
                  } else {
                    setIsSidebarOpen(prev => !prev);
                  }
                }}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <div className="relative w-4 h-4">
                  <PanelLeftClose
                    className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
                  />
                  <PanelLeftOpen
                    className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                  />
                </div>
              </button>

              <div className="flex flex-col">
                <h2 className="text-xs font-bold tracking-tight">{activeItem?.name || "Admin Terminal"}</h2>
                <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground font-bold uppercase tracking-widest">
                  <span>Control Center</span>
                  <ChevronRight className="w-2 h-2 opacity-50" />
                  <span className="text-success/80">{activeItem?.name || "Overview"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2 p-0.5 pr-2.5 bg-white/5 rounded-lg border border-white/5 group">
                <div className="w-6 h-6 rounded-lg bg-success/20 flex items-center justify-center text-success">
                  <Shield className="w-3 h-3" />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">Admin Authority</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto sidebar-scrollbar p-4 lg:p-6 relative z-10">
            {children}
          </div>
        </main>
      </div>
    </AdminProtectedRoute>
  );
}
