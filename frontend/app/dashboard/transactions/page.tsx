"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import { tradeService } from "@/services/trade";

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await tradeService.getTradeHistory(1, 20);
        setTransactions(data || []);
      } catch (err) {
        console.error("Error loading transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (value: any) => {
    if (!value) return "N/A";
    // value may be ISO string or Date
    const date = value._seconds ? new Date(value._seconds * 1000) : new Date(value);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Trade <span className="text-success">History</span></h1>
          <p className="text-[11px] text-muted-foreground">Review your past activities and trading performance.</p>
        </div>
        <div className="flex items-center gap-2">
        </div>
      </div>

      <div className="glass rounded-xl border border-white/5 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-muted-foreground text-[9px] uppercase tracking-widest font-bold">
                <th className="px-4 py-2.5">Date & Time</th>
                <th className="px-4 py-2.5">Activity</th>
                <th className="px-4 py-2.5">Asset</th>
                <th className="px-4 py-2.5 text-right">Quantity</th>
                <th className="px-4 py-2.5 text-right">Price</th>
                <th className="px-4 py-2.5 text-right">Total USD</th>
                <th className="px-4 py-2.5 text-right">Profit/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-4 py-4 h-12 bg-white/2" />
                  </tr>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[11px] font-medium">{formatDate(tx.executedAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        tx.type === 'BUY'
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-danger/10 text-danger border border-danger/20'
                      }`}>
                        {tx.type === 'BUY' ? <ArrowDownRight className="w-2.5 h-2.5" /> : <ArrowUpRight className="w-2.5 h-2.5" />}
                        {tx.type}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center font-bold text-[8px] border border-border">
                          {tx.asset.slice(0, 2)}
                        </div>
                        <span className="font-bold text-xs">{tx.asset}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{tx.quantity}</td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">${tx.priceAtTrade.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-bold text-xs ${tx.type === 'BUY' ? 'text-foreground' : 'text-success'}`}>
                      {tx.type === 'BUY' ? '-' : '+'}${tx.totalUsd.toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold text-[11px]`}>
                      {tx.pnl != null ? (
                        <div className={`inline-flex items-center gap-1 ${tx.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                          {tx.pnl >= 0 ? '+' : '-'}${Math.abs(tx.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground italic text-xs">
                    No transactions found yet. Start trading to see your history!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
          <History className="w-3 h-3" />
          Showing last 20 transactions from your history.
        </p>
      </div>
    </div>
  );
}
