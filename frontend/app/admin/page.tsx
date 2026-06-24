"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { adminService, AdminStats } from "@/services/admin";
import { motion } from "framer-motion";
import {
  Users,
  Coins,
  History,
  Shield,
  Megaphone,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Database,
  Terminal,
  Activity,
  Zap,
  BarChart3,
  ClipboardCheck,
  Award,
} from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchStats() {
      try {
        const response = await adminService.getStats();
        setStats(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchStats();
    }
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass p-6 rounded-xl border border-white/5 text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Access Denied</h3>
          <p className="text-xs text-muted-foreground">You do not have administrative permissions to view this terminal.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="space-y-4 text-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-mono">Initializing Admin Console...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass p-6 rounded-xl border border-white/5 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Error Loading Dashboard</h3>
          <p className="text-xs text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary rounded-lg text-xs font-bold hover:bg-primary/80 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Shield className="w-3.5 h-3.5 text-success" />
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Platform Administration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin <span className="text-success">Terminal</span></h1>
          <p className="text-[11px] text-muted-foreground">Manage platform parameters, users, assets, and broadcast alerts.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="glass p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-16 h-16 text-success" />
          </div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Users</p>
          <h2 className="text-2xl font-bold mt-1 tracking-tight">{stats?.totalUsers.toLocaleString()}</h2>
          <div className="flex items-center gap-1 mt-3 text-[9px] text-success font-bold">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>Accounts Registered</span>
          </div>
        </div>

        {/* System Value */}
        <div className="glass p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Coins className="w-16 h-16 text-success" />
          </div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Platform Virtual Cash</p>
          <h2 className="text-2xl font-bold mt-1 tracking-tight">${stats?.totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
          <div className="flex items-center gap-1 mt-3 text-[9px] text-success font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>Aggregate Liquidity</span>
          </div>
        </div>

        {/* Global Trades */}
        <div className="glass p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <History className="w-16 h-16 text-warning" />
          </div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Global Trades Logged</p>
          <h2 className="text-2xl font-bold mt-1 tracking-tight">{stats?.totalTrades.total.toLocaleString()}</h2>
          <div className="flex items-center justify-between mt-3 text-[8px] text-muted-foreground font-mono">
            <span className="text-success font-bold">Completed: {stats?.totalTrades.completed}</span>
            <span className="text-warning font-bold">Pending: {stats?.totalTrades.pending}</span>
            <span className="text-danger font-bold">Failed: {stats?.totalTrades.failed}</span>
          </div>
        </div>

        {/* System Assets */}
        <div className="glass p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database className="w-16 h-16 text-primary" />
          </div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Database Assets</p>
          <h2 className="text-2xl font-bold mt-1 tracking-tight">{stats?.totalAssets}</h2>
          <div className="flex items-center gap-1 mt-3 text-[9px] text-muted-foreground font-bold">
            <Database className="w-3 h-3 text-muted-foreground/60" />
            <span>Active Tickers</span>
          </div>
        </div>
      </motion.div>

     

      {/* Control Panels Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4">
        {/* Navigation Shortcuts */}
        <div className="glass p-6 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold tracking-tight border-b border-white/5 pb-2">Management Portals</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link 
              href="/admin/users" 
              className="flex items-center justify-between p-3.5 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 hover:border-success/20 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Users Directory</h4>
                  <p className="text-[9px] text-muted-foreground">Adjust balance, roles, verify</p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-success transition-colors" />
            </Link>

            <Link 
              href="/admin/assets" 
              className="flex items-center justify-between p-3.5 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 hover:border-success/20 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Asset Catalog</h4>
                  <p className="text-[9px] text-muted-foreground">List, adjust prices, edit tickers</p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-success transition-colors" />
            </Link>

            <Link 
              href="/admin/trades" 
              className="flex items-center justify-between p-3.5 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 hover:border-success/20 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Global Trade Log</h4>
                  <p className="text-[9px] text-muted-foreground">Inspect all trade history</p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-success transition-colors" />
            </Link>

            <Link 
              href="/admin/broadcast" 
              className="flex items-center justify-between p-3.5 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 hover:border-success/20 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Broadcast Center</h4>
                  <p className="text-[9px] text-muted-foreground">Send global notifications</p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-success transition-colors" />
            </Link>

            <Link 
              href="/admin/badges" 
              className="flex items-center justify-between p-3.5 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 hover:border-success/20 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Badge Manager</h4>
                  <p className="text-[9px] text-muted-foreground">Create and edit achievement badges</p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-success transition-colors" />
            </Link>

            <Link 
              href="/admin/quests" 
              className="flex items-center justify-between p-3.5 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 hover:border-success/20 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Quest Manager</h4>
                  <p className="text-[9px] text-muted-foreground">Manage daily, weekly & milestone quests</p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-success transition-colors" />
            </Link>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
