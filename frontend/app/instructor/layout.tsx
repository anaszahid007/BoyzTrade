"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, BookOpen, LogOut, PanelLeftClose, PanelLeftOpen, ChevronRight, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthActions } from "@/hooks/useAuthActions";

const navItems = [
  { name: "Dashboard", href: "/instructor", icon: LayoutDashboard },
  { name: "Courses", href: "/instructor/courses", icon: BookOpen },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("instructor_sidebar_collapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (user && user.role !== 'instructor' && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    localStorage.setItem("instructor_sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const check = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const allNavItems = [...navItems];
  const activeItem = allNavItems.find(item => pathname === item.href || (item.href !== "/instructor" && item.href !== "/dashboard" && pathname?.startsWith(item.href)));

  const renderNavItem = (item: typeof navItems[0], isSecondary = false) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (item.href !== "/instructor" && item.href !== "/dashboard" && pathname?.startsWith(item.href));
    const activeStyles = isSecondary
      ? "bg-primary/15 text-primary border-primary/20"
      : "bg-success/15 text-success border-success/20";
    const activeIconStyles = isSecondary
      ? "bg-primary text-white"
      : "bg-success text-white";
    const activeDot = isSecondary
      ? "bg-primary shadow-[0_0_10px_#6366f1]"
      : "bg-success shadow-[0_0_10px_#10b981]";
    return (
      <Link
        key={item.name}
        href={item.href}
        title={isCollapsed ? item.name : undefined}
        onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
        className={`
          group relative flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300
          ${isActive
            ? activeStyles
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"}
        `}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full gap-0' : 'gap-2.5'}`}>
          <div className={`p-1 rounded-lg transition-all duration-300 ${isActive ? activeIconStyles : "bg-white/5 text-muted-foreground group-hover:text-foreground"}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className={`font-bold text-xs overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} ${isActive ? "translate-x-0.5" : ""}`}>{item.name}</span>
        </div>
        {isActive && !isCollapsed && <div className={`w-1 h-2.5 rounded-full ${activeDot}`} />}
      </Link>
    );
  };

  return (
    <div className="h-screen bg-bg-dark text-foreground flex overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 h-screen max-h-screen bg-card/85 backdrop-blur-xl border-r border-white/5 overflow-hidden transition-all duration-300 ease-in-out
        w-60 ${isCollapsed ? "lg:w-16" : "lg:w-60"}
        ${isSidebarOpen ? "translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:block" : "-translate-x-full lg:hidden"}
      `}>
        <div className="h-full min-h-0 flex flex-col p-3 overflow-hidden">
          <div className="flex items-center mb-8">
            <Link href="/instructor" className={`flex items-center group transition-all ${isCollapsed ? 'justify-center w-full gap-0' : 'gap-2.5'}`}>
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                <img src="/images/boyztrade-logo.jpg" alt="BoyzTrade" className="w-full h-full object-cover" />
              </div>
              <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                <span className="text-base font-bold tracking-tight leading-none whitespace-nowrap">Boyz<span className="text-success">Learn</span></span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest mt-0.5 font-bold whitespace-nowrap">Instructor Portal</span>
              </div>
            </Link>
          </div>

          <div className="flex-1 min-h-0 space-y-4 overflow-y-auto sidebar-scrollbar py-1">
            <nav className="space-y-0.5">
              <p className={`text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-3 mb-2 overflow-hidden transition-all duration-300 ${isCollapsed ? 'h-0 opacity-0 mb-0' : 'opacity-40 h-auto'}`}>Instructor</p>
              {navItems.map(item => renderNavItem(item))}
            </nav>
          </div>

          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="group p-2.5 bg-white/5 rounded-xl border border-white/5">
              <div className={`flex items-center ${isCollapsed ? 'justify-center gap-0' : 'gap-2.5'}`}>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center text-white font-bold text-[9px] border-2 border-white/10 shadow-lg shrink-0">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'I'}
                </div>
                <div className={`flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  <p className="text-[11px] font-bold truncate leading-none">{user?.fullName || "Instructor"}</p>
                  <p className="text-[8px] text-muted-foreground truncate opacity-70 mt-0.5">Instructor</p>
                </div>
              </div>
            </div>

            <button onClick={logout}
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

      <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-success/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <header className="h-12 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 backdrop-blur-md bg-bg-dark/50 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors" onClick={() => {
              if (window.innerWidth >= 1024) setIsCollapsed(prev => !prev);
              else setIsSidebarOpen(prev => !prev);
            }}>
              <div className="relative w-4 h-4">
                <PanelLeftClose className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`} />
                <PanelLeftOpen className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
              </div>
            </button>

            <div className="flex flex-col">
              <h2 className="text-xs font-bold tracking-tight">{activeItem?.name || "Instructor Portal"}</h2>
              <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground font-bold uppercase tracking-widest">
                <span>Instructor</span>
                <ChevronRight className="w-2 h-2 opacity-50" />
                <span className="text-success/80">{activeItem?.name || "Overview"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 p-0.5 pr-2.5 bg-white/5 rounded-lg border border-white/5 group">
              <div className="w-6 h-6 rounded-lg bg-success/20 flex items-center justify-center text-success">
                <GraduationCap className="w-3 h-3" />
              </div>
              <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">Instructor</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto sidebar-scrollbar p-4 lg:p-6 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
