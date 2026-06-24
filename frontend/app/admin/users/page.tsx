"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService, AdminUser } from "@/services/admin";
import {
  Users,
  Search,
  Filter,
  Shield,
  Trash2,
  DollarSign,
  AlertTriangle,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Zap,
  Flame,
  ClipboardCheck,
  Eye,
  Award,
  BarChart3,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// ─── User Details Modal ────────────────────────────────────────
function UserDetailsModal({
  userId,
  onClose,
  onUpdate,
}: {
  userId: string;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [togglingRole, setTogglingRole] = useState(false);
  const [togglingVerify, setTogglingVerify] = useState(false);

  // Sub-modal states embedded here
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustDesc, setAdjustDesc] = useState("Admin Adjustment");
  const [adjustLoading, setAdjustLoading] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchDetails = useCallback(async () => {
    setLoadingDetails(true);
    try {
      const res = await adminService.getUser(userId);
      setData(res.data);
    } catch {
      // silent
    } finally {
      setLoadingDetails(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleToggleRole = async () => {
    if (!data) return;
    if (userId === currentUser?._id) { setErrorMsg("Cannot change own role."); return; }
    const isConfirm = confirm(`Are you sure you want to change the role of ${data.user.fullName} from ${data.user.role} to ${data.user.role === "admin" ? "user" : "admin"}?`);
    if (!isConfirm) return;
    setTogglingRole(true);
    setErrorMsg("");
    try {
      await adminService.updateUserRole(userId, data.user.role === "admin" ? "user" : "admin");
      await fetchDetails();
      onUpdate();
    } catch (err: any) { setErrorMsg(err.message); }
    finally { setTogglingRole(false); }
  };

  const handleToggleVerify = async () => {
    if (!data) return;
    const isConfirm = confirm(`Are you sure you want to ${data.user.isVerified ? "unverify" : "verify"} ${data.user.fullName}'s email?`);
    if(!isConfirm) return;
    setErrorMsg("");
    setTogglingVerify(true);
    try {
      await adminService.toggleUserVerification(userId);
      await fetchDetails();
      onUpdate();
    } catch (err: any) { setErrorMsg(err.message); }
    finally { setTogglingVerify(false); }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount === 0) { setErrorMsg("Enter a valid non-zero amount"); return; }
    setErrorMsg("");
    setAdjustLoading(true);
    try {
      await adminService.adjustUserBalance(userId, amount, adjustDesc);
      await fetchDetails();
      onUpdate();
      setShowAdjust(false);
      setAdjustAmount("");
    } catch (err: any) { setErrorMsg(err.message); }
    finally { setAdjustLoading(false); }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText.toLowerCase() !== "delete") { setErrorMsg("Type 'delete' to confirm"); return; }
    setErrorMsg("");
    setDeleteLoading(true);
    try {
      await adminService.deleteUser(userId);
      onUpdate();
      onClose();
    } catch (err: any) { setErrorMsg(err.message); }
    finally { setDeleteLoading(false); }
  };

  if (loadingDetails) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div className="glass p-8 rounded-xl border border-white/10">
          <div className="w-6 h-6 border-2 border-success/30 border-t-success rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user: u, portfolio, gamification } = data;
  const survey = u.onboardingSurvey || {};

  const xpProgress = gamification && gamification.xpForNext > gamification.xpForCurrent
    ? Math.min(100, ((gamification.xp - gamification.xpForCurrent) / (gamification.xpForNext - gamification.xpForCurrent)) * 100)
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="glass w-full max-w-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl relative font-sans my-8">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-all z-10">
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto sidebar-scrollbar">
          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-danger/10 border border-danger/20 text-[10px] text-danger font-medium">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              <span className="flex-1">{errorMsg}</span>
              <button onClick={() => setErrorMsg("")} className="p-0.5 hover:bg-white/10 rounded">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
          {/* ── Profile Header ── */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success/30 to-emerald-600/30 flex items-center justify-center text-success font-bold text-sm border border-white/5 shrink-0">
              {u.fullName?.charAt(0) || u.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">{u.fullName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
              <p className="text-[8px] text-muted-foreground/50 mt-0.5">
                Joined {new Date(u.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* ── Account Status ── */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Account Status</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Role</span>
              <button
                onClick={handleToggleRole}
                disabled={togglingRole || userId === currentUser?._id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors ${
                  u.role === "admin"
                    ? "bg-success/10 border-success/20 text-success hover:bg-success/20"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                } disabled:opacity-50`}
              >
                <Shield className="w-2.5 h-2.5" />
                {u.role.toUpperCase()}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Email Verified</span>
              <button
                onClick={handleToggleVerify}
                disabled={togglingVerify}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors ${
                  u.isVerified
                    ? "bg-success/10 border-success/20 text-success hover:bg-success/20"
                    : "bg-warning/10 border-warning/20 text-warning hover:bg-warning/20"
                }`}
              >
                {u.isVerified ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                {u.isVerified ? "VERIFIED" : "PENDING"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Onboarding Survey</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                u.surveyCompleted
                  ? "bg-success/10 border-success/20 text-success"
                  : "bg-white/5 border-white/10 text-muted-foreground"
              }`}>
                {u.surveyCompleted ? (
                  <><ClipboardCheck className="w-2.5 h-2.5" /> COMPLETED</>
                ) : "NOT DONE"}
              </span>
            </div>
          </div>

          {/* ── Gamification ── */}
          {gamification && (
            <div className="space-y-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Award className="w-3 h-3 text-warning" />
                Level & XP
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-base font-black text-primary">{gamification.level}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight">{gamification.levelTitle}</p>
                  <p className="text-[9px] text-muted-foreground">Level {gamification.level}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-warning" />
                    {gamification.xp.toLocaleString()} / {gamification.xpForNext.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-500" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    <Flame className="w-3 h-3" />
                    <span className="text-xs font-bold">{gamification.currentStreak}</span>
                  </div>
                  <p className="text-[7px] text-muted-foreground/60">Streak</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="flex items-center justify-center gap-1 text-success">
                    <BarChart3 className="w-3 h-3" />
                    <span className="text-xs font-bold">{gamification.totalTrades}</span>
                  </div>
                  <p className="text-[7px] text-muted-foreground/60">Trades</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="flex items-center justify-center gap-1 text-primary">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-bold">{gamification.profitableTrades}</span>
                  </div>
                  <p className="text-[7px] text-muted-foreground/60">Profitable</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Survey ── */}
          {u.surveyCompleted && (
            <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-success" />
                Survey Responses
              </p>
              <div className="space-y-1.5 text-[10px]">
                {survey.experienceLevel && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-bold capitalize">{survey.experienceLevel}</span>
                  </div>
                )}
                {survey.referralSource && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Referral Source</span>
                    <span className="font-bold capitalize">{survey.referralSource.replace(/_/g, " ")}</span>
                  </div>
                )}
                {survey.tradingGoals && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Trading Goals</span>
                    <span className="font-bold capitalize">{survey.tradingGoals.replace(/_/g, " ")}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Account Details ── */}
          <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Account Details</p>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cash Balance</span>
                <span className="font-mono font-bold">${(portfolio?.cash_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Portfolio Value</span>
                <span className="font-mono font-bold">${(portfolio?.total_portfolio_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total P&L</span>
                <span className={`font-mono font-bold ${(portfolio?.total_profit_loss ?? 0) >= 0 ? "text-success" : "text-danger"}`}>
                  {(portfolio?.total_profit_loss ?? 0) >= 0 ? "+" : ""}${(portfolio?.total_profit_loss ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-2 pt-1">
            {!showAdjust && !showDelete && (
              <>
                <Button
                  onClick={() => setShowAdjust(true)}
                  className="flex-1 text-[10px] font-bold py-2 rounded-lg"
                >
                  <DollarSign className="w-3 h-3 mr-1" />
                  Adjust Balance
                </Button>
                <Button
                  onClick={() => setShowDelete(true)}
                  disabled={userId === currentUser?._id}
                  className="flex-1 text-[10px] font-bold py-2 rounded-lg bg-success border border-success/30 text-white hover:bg-success/85 disabled:opacity-40"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete User
                </Button>
              </>
            )}
          </div>

          {/* ── Inline Adjust Form ── */}
          {showAdjust && (
            <form onSubmit={handleAdjustSubmit} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold text-muted-foreground">Adjust Balance</p>
                <button type="button" onClick={() => setShowAdjust(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <input
                type="number" step="0.01" required
                placeholder="Amount (e.g. 5000 or -2000)"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono focus:outline-none focus:border-success/50"
              />
              <input
                type="text" required
                placeholder="Description"
                value={adjustDesc}
                onChange={(e) => setAdjustDesc(e.target.value)}
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] focus:outline-none focus:border-success/50"
              />
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowAdjust(false)} className="flex-1 text-[9px] py-1.5 rounded-lg">
                  Cancel
                </Button>
                <Button type="submit" isLoading={adjustLoading} className="flex-1 text-[9px] py-1.5 rounded-lg">
                  Confirm
                </Button>
              </div>
            </form>
          )}

          {/* ── Inline Delete Confirm ── */}
          {showDelete && (
            <form onSubmit={handleDeleteSubmit} className="p-3.5 rounded-xl bg-success/5 border border-success/20 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold text-success flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Confirm Deletion
                </p>
                <button type="button" onClick={() => setShowDelete(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[9px] text-success/70">Type <strong>delete</strong> to confirm permanent removal of <strong>{u.fullName}</strong>.</p>
              <input
                type="text" required
                placeholder='Type "delete" to confirm...'
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono focus:outline-none focus:border-success/50"
              />
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowDelete(false)} className="flex-1 text-[9px] py-1.5 rounded-lg">
                  Keep
                </Button>
                <Button type="submit" isLoading={deleteLoading} className="flex-1 text-[9px] py-1.5 rounded-lg bg-success border border-success/30 text-white hover:bg-success/85">
                  Delete
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Users Management Page ──────────────────────────────────
export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isVerified, setIsVerified] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Details modal
  const [detailsUserId, setDetailsUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers({
        page,
        limit: 15,
        search,
        role,
        isVerified
      });
      setUsers(response.data || []);
      const pagination = (response as any).pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, search, role, isVerified]);

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass p-6 rounded-xl border border-white/5 text-center">
          <p className="text-success font-bold">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-[10px] text-success font-bold hover:underline mb-1">
            <ArrowLeft className="w-3 h-3" />
            Back to Admin Terminal
          </Link>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-success" />
            Users Directory
          </h1>
          <p className="text-[11px] text-muted-foreground">Search and manage registered profiles, balance accounts, and authorization parameters.</p>
        </div>
        <Button variant="secondary" onClick={fetchUsers} className="w-fit text-[10px] h-8 font-bold border-white/5 hover:border-success/20 transition-all shrink-0">
          <RefreshCcw className="w-3 h-3 mr-1.5" />
          Refresh Registry
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass p-4 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative group col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-success transition-colors" />
          <input
            type="text"
            placeholder="Search by full name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs text-muted-foreground focus:outline-none focus:border-success/50 focus:bg-white/10 focus:text-foreground transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#0b0c10]">All Roles</option>
            <option value="user" className="bg-[#0b0c10]">User Role</option>
            <option value="admin" className="bg-[#0b0c10]">Admin Role</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={isVerified}
            onChange={(e) => { setIsVerified(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs text-muted-foreground focus:outline-none focus:border-success/50 focus:bg-white/10 focus:text-foreground transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#0b0c10]">All Verification</option>
            <option value="true" className="bg-[#0b0c10]">Verified Email</option>
            <option value="false" className="bg-[#0b0c10]">Unverified Email</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
        </div>
      </div>

      {/* Main Table */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-muted-foreground text-[8px] uppercase tracking-[0.2em] font-bold">
                <th className="px-4 py-3">Trader</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3 text-center">Verified</th>
                <th className="px-4 py-3 text-right">Level</th>
                <th className="px-4 py-3 text-right">XP</th>
                <th className="px-4 py-3 text-right">Streak</th>
                <th className="px-4 py-3 text-center">Survey</th>
                <th className="px-4 py-3 text-right">Cash Reserves</th>
                <th className="px-4 py-3 text-right">Joined</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-success/30 border-t-success rounded-full animate-spin mx-auto mb-2" />
                    Querying records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    No registry profiles match current filters.
                  </td>
                </tr>
              ) : (
                users.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.01] transition-all">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-success/30 to-emerald-600/30 flex items-center justify-center text-success font-bold text-xs border border-white/5">
                          {item.fullName?.charAt(0) || item.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-xs leading-none mb-0.5">{item.fullName}</p>
                          <p className="text-[9px] text-muted-foreground">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        item.role === "admin"
                          ? "bg-success/10 border-success/20 text-success"
                          : "bg-white/5 border-white/10 text-muted-foreground"
                      }`}>
                        <Shield className="w-2.5 h-2.5" />
                        {item.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        item.isVerified
                          ? "bg-success/10 border-success/20 text-success"
                          : "bg-warning/10 border-warning/20 text-warning"
                      }`}>
                        {item.isVerified ? (
                          <><CheckCircle className="w-2.5 h-2.5" /> VERIFIED</>
                        ) : (
                          <><Clock className="w-2.5 h-2.5" /> PENDING</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-bold tracking-tight">
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">
                        Lv.{item.gamification?.level ?? 1}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs">
                      <span className="flex items-center justify-end gap-1 text-warning">
                        <Zap className="w-2.5 h-2.5" />
                        {(item.gamification?.xp ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs">
                      <span className="flex items-center justify-end gap-1 text-amber-400">
                        <Flame className="w-2.5 h-2.5" />
                        {item.gamification?.currentStreak ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.surveyCompleted ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-success/10 border border-success/20 text-success">
                          <ClipboardCheck className="w-2 h-2" />
                          DONE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-white/5 border border-white/10 text-muted-foreground">
                          --
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-bold tracking-tight">
                      ${(item.portfolio?.totalBalance ?? 2500).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[10px] text-muted-foreground font-mono">
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setDetailsUserId(item._id)}
                        title="View Details"
                        className="p-1.5 bg-white/5 hover:bg-primary/20 border border-white/5 hover:border-primary/30 rounded text-muted-foreground hover:text-primary transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/2 border-t border-white/5 px-4 py-3 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Page <span className="text-foreground font-bold">{page}</span> of <span className="text-foreground font-bold">{totalPages}</span>
            </span>
            <div className="inline-flex items-center gap-1.5">
              <Button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1 h-7 w-7 rounded-md border border-white/5 flex items-center justify-center disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1 h-7 w-7 rounded-md border border-white/5 flex items-center justify-center disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {detailsUserId && (
        <UserDetailsModal
          userId={detailsUserId}
          onClose={() => setDetailsUserId(null)}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
}
