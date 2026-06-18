"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService, AdminTrade } from "@/services/admin";
import {
  History,
  Search,
  Filter,
  ArrowLeft,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalTradeLog() {
  const { user } = useAuth();
  
  // Data state
  const [trades, setTrades] = useState<AdminTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Query state
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getTrades({
        page,
        limit: 15,
        symbol,
        type,
        status,
        userId: userIdFilter
      });
      setTrades(response.data || []);
      const pagination = (response as any).pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch trades log");
    } finally {
      setLoading(false);
    }
  }, [page, symbol, type, status, userIdFilter]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchTrades();
    }
  }, [user, fetchTrades]);

  if (!user || user.role !== "admin") {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-[10px] text-success font-bold hover:underline mb-1">
            <ArrowLeft className="w-3 h-3" />
            Back to Admin Terminal
          </Link>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-success" />
            Global Trade Log
          </h1>
          <p className="text-[11px] text-muted-foreground">Inspect and audit all transaction logs, buy/sell executions, and order statuses across the system.</p>
        </div>

        <Button 
          variant="secondary" 
          onClick={fetchTrades} 
          className="w-fit text-[10px] h-8 font-bold border-white/5 hover:border-success/20 transition-all shrink-0"
        >
          <RefreshCcw className="w-3 h-3 mr-1.5" />
          Sync Logs
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="glass p-4 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Symbol filter */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-success transition-colors" />
          <input
            type="text"
            placeholder="Asset Symbol (e.g. BTC)..."
            value={symbol}
            onChange={(e) => { setSymbol(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all uppercase font-mono"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs text-muted-foreground focus:outline-none focus:border-success/50 focus:bg-white/10 focus:text-foreground transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#0b0c10]">All Trade Types</option>
            <option value="BUY" className="bg-[#0b0c10]">BUY Orders</option>
            <option value="SELL" className="bg-[#0b0c10]">SELL Orders</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs text-muted-foreground focus:outline-none focus:border-success/50 focus:bg-white/10 focus:text-foreground transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#0b0c10]">All Statuses</option>
            <option value="COMPLETED" className="bg-[#0b0c10]">COMPLETED</option>
            <option value="PENDING" className="bg-[#0b0c10]">PENDING</option>
            <option value="FAILED" className="bg-[#0b0c10]">FAILED</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
        </div>

        {/* User filter */}
        <div className="relative group">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-success transition-colors" />
          <input
            type="text"
            placeholder="User Database ID..."
            value={userIdFilter}
            onChange={(e) => { setUserIdFilter(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all font-mono"
          />
        </div>
      </div>

      {/* Table listing */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-muted-foreground text-[8px] uppercase tracking-[0.2em] font-bold">
                <th className="px-4 py-3">Trade ID</th>
                <th className="px-4 py-3">Trader</th>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Total USD</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-success/30 border-t-success rounded-full animate-spin mx-auto mb-2" />
                    Querying trade logs...
                  </td>
                </tr>
              ) : trades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    No trades match current filters.
                  </td>
                </tr>
              ) : (
                trades.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.01] transition-all">
                    <td className="px-4 py-3.5 font-mono text-[9px] text-muted-foreground">
                      {item._id}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.userId ? (
                        <div>
                          <p className="font-bold text-xs leading-none mb-0.5">{item.userId.fullName}</p>
                          <p className="text-[9px] text-muted-foreground">{item.userId.email}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Deleted User</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.assetId ? (
                        <div className="flex items-center gap-2">
                          {item.assetId.logo && (
                            <img src={item.assetId.logo} alt={item.assetId.symbol} className="w-4 h-4 rounded-md" />
                          )}
                          <span className="font-bold text-xs">{item.assetId.symbol}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">UNKNOWN</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        item.tradeType === "BUY"
                          ? "bg-success/10 border-success/20 text-success"
                          : "bg-success/10 border-success/20 text-success"
                      }`}>
                        {item.tradeType === "BUY" ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                        {item.tradeType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-medium">
                      {item.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-bold text-muted-foreground">
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-bold">
                      ${item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        item.status === "COMPLETED"
                          ? "bg-success/10 border-success/20 text-success"
                          : item.status === "PENDING"
                          ? "bg-warning/10 border-warning/20 text-warning"
                          : "bg-success/10 border-success/20 text-success"
                      }`}>
                        {item.status === "COMPLETED" ? (
                          <CheckCircle className="w-2.5 h-2.5" />
                        ) : item.status === "PENDING" ? (
                          <Clock className="w-2.5 h-2.5" />
                        ) : (
                          <XCircle className="w-2.5 h-2.5" />
                        )}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-[10px] text-muted-foreground font-mono">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {trades.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/[0.01]">
            <p className="text-[9px] text-muted-foreground/40">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
