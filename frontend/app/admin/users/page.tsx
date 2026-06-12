"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService, AdminUser } from "@/services/admin";
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  DollarSign,
  AlertTriangle,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  
  // Data State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isVerified, setIsVerified] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal States
  const [balanceModalUser, setBalanceModalUser] = useState<AdminUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [adjustDesc, setAdjustDesc] = useState<string>("Admin Adjustment");
  const [adjustLoading, setAdjustLoading] = useState(false);
  
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUser | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    if (userId === currentUser?._id) {
      alert("You cannot change your own admin role.");
      return;
    }
    try {
      await adminService.updateUserRole(userId, nextRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: nextRole } : u));
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
  };

  const handleToggleVerify = async (userId: string) => {
    try {
      const response = await adminService.toggleUserVerification(userId);
      const updated = response.data;
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerified: updated.isVerified } : u));
    } catch (err: any) {
      alert(err.message || "Failed to update verification status");
    }
  };

  const handleAdjustBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceModalUser) return;
    
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum === 0) {
      alert("Please enter a valid non-zero adjust amount");
      return;
    }

    setAdjustLoading(true);
    try {
      await adminService.adjustUserBalance(balanceModalUser._id, amountNum, adjustDesc);
      
      setUsers(prev => prev.map(u => {
        if (u._id === balanceModalUser._id) {
          return {
            ...u,
            portfolio: {
              ...u.portfolio,
              totalBalance: u.portfolio.totalBalance + amountNum
            }
          };
        }
        return u;
      }));

      setBalanceModalUser(null);
      setAdjustAmount("");
      setAdjustDesc("Admin Adjustment");
    } catch (err: any) {
      alert(err.message || "Failed to adjust user balance");
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleDeleteUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteModalUser) return;

    if (deleteConfirmText.toLowerCase() !== "delete") {
      alert("Please type 'delete' to confirm user deletion.");
      return;
    }

    setDeleteLoading(true);
    try {
      await adminService.deleteUser(deleteModalUser._id);
      setUsers(prev => prev.filter(u => u._id !== deleteModalUser._id));
      setDeleteModalUser(null);
      setDeleteConfirmText("");
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

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
        {/* Search */}
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

        {/* Role Filter */}
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

        {/* Verification Status */}
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
                <th className="px-4 py-3 text-right">Cash Reserves</th>
                <th className="px-4 py-3 text-right">Joined</th>
                <th className="px-4 py-3 text-center">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-success/30 border-t-success rounded-full animate-spin mx-auto mb-2" />
                    Querying records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-xs text-muted-foreground">
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
                      <button
                        onClick={() => handleToggleRole(item._id, item.role)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors ${
                          item.role === "admin"
                            ? "bg-success/10 border-success/20 text-success hover:bg-success/20"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                        }`}
                      >
                        <Shield className="w-2.5 h-2.5" />
                        {item.role.toUpperCase()}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleVerify(item._id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors ${
                          item.isVerified
                            ? "bg-success/10 border-success/20 text-success hover:bg-success/20"
                            : "bg-warning/10 border-warning/20 text-warning hover:bg-warning/20"
                        }`}
                      >
                        {item.isVerified ? (
                          <>
                            <UserCheck className="w-2.5 h-2.5" />
                            VERIFIED
                          </>
                        ) : (
                          <>
                            <UserX className="w-2.5 h-2.5" />
                            PENDING
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-bold tracking-tight">
                      ${(item.portfolio?.totalBalance ?? 10000).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[10px] text-muted-foreground font-mono">
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setBalanceModalUser(item)}
                          title="Adjust Balance"
                          className="p-1 bg-white/5 hover:bg-success/20 border border-white/5 hover:border-success/30 rounded text-muted-foreground hover:text-success transition-all"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteModalUser(item)}
                          disabled={item._id === currentUser?._id}
                          title="Delete User"
                          className={`p-1 bg-white/5 border border-white/5 rounded transition-all ${
                            item._id === currentUser?._id 
                              ? "opacity-30 cursor-not-allowed text-muted-foreground" 
                              : "hover:bg-success/25 hover:border-success/40 hover:text-success text-muted-foreground"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
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

      {/* Adjust Balance Modal */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass w-full max-w-md border border-white/10 rounded-xl overflow-hidden shadow-2xl relative font-sans">
            <button
              onClick={() => { setBalanceModalUser(null); setAdjustAmount(""); }}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleAdjustBalanceSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold tracking-tight">Adjust Virtual Balance</h3>
                <p className="text-[10px] text-muted-foreground">
                  Modifying balance for <span className="text-foreground font-bold">{balanceModalUser.fullName}</span>.
                </p>
              </div>

              <div className="p-3 bg-white/2 rounded-lg border border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Current reserves:</span>
                <span className="text-xs font-mono font-bold">${balanceModalUser.portfolio?.totalBalance.toLocaleString()}</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Adjustment Amount (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 5000 (deposit) or -2000 (deduct)"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Description / Log Message
                  </label>
                  <input
                    type="text"
                    required
                    value={adjustDesc}
                    onChange={(e) => setAdjustDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setBalanceModalUser(null); setAdjustAmount(""); }}
                  className="w-full text-xs font-bold py-2 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={adjustLoading}
                  className="w-full text-xs font-bold py-2 rounded-lg"
                >
                  Confirm Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass w-full max-w-md border border-white/10 rounded-xl overflow-hidden shadow-2xl relative font-sans">
            <button
              onClick={() => { setDeleteModalUser(null); setDeleteConfirmText(""); }}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleDeleteUserSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-success">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold tracking-tight">Cascade Delete Account</h3>
              </div>

              <div className="p-3 bg-success/5 border border-success/20 rounded-lg text-[10px] text-success/80 leading-relaxed">
                <strong>CRITICAL WARNING:</strong> This action is permanent and completely irreversible. It will delete the user profile for <strong>{deleteModalUser.fullName}</strong> ({deleteModalUser.email}) and permanently cascade remove all associated data.
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground leading-normal">
                  To confirm this cascade deletion, type <span className="text-foreground font-bold">delete</span> in the field below:
                </p>
                <input
                  type="text"
                  required
                  placeholder="Type delete to confirm..."
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setDeleteModalUser(null); setDeleteConfirmText(""); }}
                  className="w-full text-xs font-bold py-2 rounded-lg"
                >
                  Keep Account
                </Button>
                <Button
                  type="submit"
                  isLoading={deleteLoading}
                  className="w-full text-xs font-bold py-2 rounded-lg bg-success border border-success/30 text-white hover:bg-success/85"
                >
                  Confirm Delete
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
