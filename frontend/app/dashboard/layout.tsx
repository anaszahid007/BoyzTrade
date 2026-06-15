"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  User as UserIcon,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { tradeService, AssetSummary } from "@/services/trade";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const breadcrumbLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/portfolio": "Portfolio",
  "/dashboard/trade": "Trade",
  "/dashboard/watchlist": "Watchlist",
  "/dashboard/transactions": "History",
  "/dashboard/notifications": "Notifications",
  "/dashboard/settings": "Settings",
  "/admin": "Admin Panel",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
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

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
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

  const activeItemLabel = breadcrumbLabels[pathname] ||
    (pathname?.startsWith("/dashboard/trade") ? "Trade" :
     pathname?.startsWith("/admin") ? "Admin Panel" : undefined);

  return (
    <ProtectedRoute>
      <div className="h-screen bg-bg-dark text-foreground flex overflow-hidden">
        <DashboardSidebar
          isCollapsed={isCollapsed}
          isSidebarOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

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
                <h2 className="text-xs font-bold tracking-tight">{activeItemLabel || "Dashboard"}</h2>
                <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground font-bold uppercase tracking-widest">
                  <span>Platform</span>
                  <ChevronRight className="w-2 h-2 opacity-50" />
                  <span className="text-primary/80">{activeItemLabel || "Overview"}</span>
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
                        No assets found for &ldquo;{searchQuery}&rdquo;
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <NotificationBell />

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
