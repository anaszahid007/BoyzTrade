"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Settings,
  LogOut,
  TrendingUp,
  Bell,
  Search,
  User as UserIcon,
  ChevronRight,
  TrendingDown,
  ArrowUpRight,
  CheckCheck,
  X,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useNotifications } from "@/hooks/useNotifications";
import { tradeService, AssetSummary } from "@/services/trade";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: Wallet },
  { name: "Trade", href: "/dashboard/trade", icon: ArrowLeftRight },
  { name: "Watchlist", href: "/dashboard/watchlist", icon: Star },
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
  const router = useRouter();
  const { user } = useAuth();
  const { portfolio } = usePortfolio();
  const { logout } = useAuthActions();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar_collapsed");
      return stored === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AssetSummary[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    try {
      const data = await tradeService.getAssets(query, 1, 10);
      setSearchResults(data);
      setShowDropdown(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 250);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/dashboard/trade?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSelectAsset = (symbol: string) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    router.push(`/dashboard/trade/${symbol}`);
  };

  // Notification state
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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

  const visibleNavItems = [...navItems];
  if (user?.role === "admin") {
    visibleNavItems.push({ name: "Admin Panel", href: "/dashboard/admin", icon: Shield });
  }

  const activeItem = [...visibleNavItems, ...secondaryNavItems].find(item => 
    pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
  );

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
        fixed inset-y-0 left-0 z-50 h-screen max-h-screen bg-card/80 backdrop-blur-xl border-r border-white/5 overflow-hidden transition-all duration-300 ease-in-out
        w-60 ${isCollapsed ? "lg:w-16" : "lg:w-60"}
        ${isSidebarOpen ? "translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:block" : "-translate-x-full lg:hidden"}
      `}>
          <div className="h-full min-h-0 flex flex-col p-3 overflow-hidden">
            {/* Logo Section */}
            <div className="flex items-center mb-8">
              <Link href="/dashboard" className={`flex items-center group transition-all ${isCollapsed ? 'justify-center w-full gap-0' : 'gap-2.5'}`}>
                <div className="p-1.5 bg-primary/10 rounded-lg neon-glow-blue border border-primary/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
                  <TrendingUp className="w-4 h-4 text-primary" />
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
                      onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                      className={`
                      group relative flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300
                      ${isActive
                          ? "bg-primary/15 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] border border-primary/20"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"}
                    `}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center w-full gap-0' : 'gap-2.5'}`}>
                        <div className={`
                        p-1 rounded-lg transition-all duration-300
                        ${isActive ? "bg-primary text-white shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" : "bg-white/5 text-muted-foreground group-hover:text-foreground"}
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
                      onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
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

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
          {/* Background Glows for Main Content */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

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
                <h2 className="text-xs font-bold tracking-tight">{activeItem?.name || "Dashboard"}</h2>
                <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground font-bold uppercase tracking-widest">
                  <span>Platform</span>
                  <ChevronRight className="w-2 h-2 opacity-50" />
                  <span className="text-primary/80">{activeItem?.name || "Overview"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:flex relative" ref={searchRef}>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                    className="pl-8 pr-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[11px] w-52 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all leading-none"
                  />
                </div>

                {/* Search Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b0c10] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50">
                    {searchLoading ? (
                      <div className="px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
                        <div className="w-2.5 h-2.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        Searching...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div>
                        {searchResults.map((asset, idx) => (
                          <button
                            key={asset.symbol}
                            onClick={() => handleSelectAsset(asset.symbol)}
                            className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left ${idx < searchResults.length - 1 ? "border-b border-white/5" : ""
                              }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold">{asset.symbol}</span>
                                <span className="text-[9px] text-muted-foreground truncate">{asset.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-mono">
                                  ${(asset.current_price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className={`flex items-center gap-0.5 text-[9px] ${(asset.price_change_24h ?? 0) >= 0 ? "text-success" : "text-danger"}`}>
                                  {(asset.price_change_24h ?? 0) >= 0 ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                                  {Math.abs(asset.price_change_24h ?? 0).toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <ArrowUpRight className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            router.push(`/dashboard/trade?q=${encodeURIComponent(searchQuery)}`);
                          }}
                          className="w-full px-3 py-2 text-[10px] text-primary font-bold border-t border-white/5 hover:bg-white/5 transition-colors text-center"
                        >
                          View all results
                        </button>
                      </div>
                    ) : searchQuery.trim() ? (
                      <div className="px-3 py-2 text-[11px] text-muted-foreground">
                        No assets found for "{searchQuery}"
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
                >
                  <Bell className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 bg-danger text-white text-[8px] font-bold rounded-full border border-bg-dark">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-1 w-80 bg-[#0b0c10] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                      <span className="text-xs font-bold text-foreground">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="flex items-center gap-1 text-[9px] text-primary hover:text-primary/80 transition-colors"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-3 py-6 text-center text-[10px] text-muted-foreground">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <button
                            key={n._id}
                            onClick={() => { if (!n.isRead) markAsRead(n._id); }}
                            className={`w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 ${!n.isRead ? "bg-primary/5" : ""
                              }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-foreground leading-none">{n.title}</span>
                                  {!n.isRead && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                  )}
                                </div>
                                <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                                <p className="text-[8px] text-muted-foreground/50 mt-0.5">
                                  {new Date(n.createdAt).toLocaleString("en-US", {
                                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}
                                className="shrink-0 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {notifications.length > 10 && (
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="w-full px-3 py-2 text-[10px] text-primary font-bold border-t border-white/5 hover:bg-white/5 transition-colors text-center"
                      >
                        View all notifications
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="h-6 w-[1px] bg-white/5 mx-0.5 hidden sm:block" />

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 p-0.5 pr-2.5 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all cursor-pointer group hidden sm:flex"
              >
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary transition-transform group-hover:scale-105">
                  <UserIcon className="w-3 h-3" />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">Profile</span>
              </Link>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto sidebar-scrollbar p-4 lg:p-6 relative z-10">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
