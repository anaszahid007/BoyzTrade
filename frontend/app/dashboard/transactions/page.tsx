"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { tradeService } from "@/lib/trade";

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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Trade <span className="gradient-text">History</span></h1>
          <p className="text-muted-foreground">Review your past activities and trading performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="px-4">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="secondary" className="px-4">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-muted-foreground text-xs uppercase tracking-widest font-bold">
                <th className="px-8 py-5">Date & Time</th>
                <th className="px-8 py-5">Activity</th>
                <th className="px-8 py-5">Asset</th>
                <th className="px-8 py-5 text-right">Quantity</th>
                <th className="px-8 py-5 text-right">Price</th>
                <th className="px-8 py-5 text-right">Total USD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6 h-16 bg-white/2" />
                  </tr>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">{formatDate(tx.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        tx.type === 'BUY'
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-danger/10 text-danger border border-danger/20'
                      }`}>
                        {tx.type === 'BUY' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {tx.type}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-[10px] border border-border">
                          {tx.asset.slice(0, 2)}
                        </div>
                        <span className="font-bold">{tx.asset}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-mono font-medium">{tx.quantity}</td>
                    <td className="px-8 py-6 text-right font-mono text-muted-foreground">${tx.priceAtTrade.toLocaleString()}</td>
                    <td className={`px-8 py-6 text-right font-bold text-lg ${tx.type === 'BUY' ? 'text-foreground' : 'text-success'}`}>
                      {tx.type === 'BUY' ? '-' : '+'}${tx.totalUsd.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-muted-foreground italic">
                    No transactions found yet. Start trading to see your history!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground italic flex items-center gap-2">
          <History className="w-4 h-4" />
          Showing last 20 transactions from your history.
        </p>
      </div>
    </div>
  );
}
