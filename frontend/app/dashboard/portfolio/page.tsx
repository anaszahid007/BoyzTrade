"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePortfolio } from "@/hooks/usePortfolio";
import Link from "next/link";

export default function PortfolioPage() {
  const { portfolio, loading, error } = usePortfolio();

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-3">
        <div className="p-3 bg-danger/10 text-danger rounded-xl border border-danger/20 text-sm">
          {error || "Failed to load portfolio"}
        </div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const uiPortfolio = {
    balance: portfolio.cash_balance,
    totalValue: portfolio.total_portfolio_value,
    overallPnL: portfolio.total_profit_loss,
    overallPnLPercent: Number(portfolio.total_profit_loss_percentage),
    holdings: portfolio.holdings.map((holding) => ({
      symbol: holding.symbol,
      quantity: holding.quantity,
      avgBuyPrice: holding.avg_buy_price,
      currentPrice: holding.current_price,
      pnl: holding.profit_loss,
      pnlPercent: Number(holding.profit_loss_percentage),
    })),
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Your <span className="text-success">Portfolio</span></h1>
        <p className="text-[11px] text-muted-foreground">Detailed overview of your virtual holdings and performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 glass p-4 rounded-xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-[-10%] right-[-10%] w-36 h-36 bg-primary/10 blur-[60px] rounded-full" />

          <div className="space-y-0.5 relative z-10">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Net Worth</p>
            <h2 className="text-3xl font-bold tracking-tighter">${uiPortfolio.totalValue.toLocaleString()}</h2>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 relative z-10">
            <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
              <p className="text-[8px] text-muted-foreground mb-0.5 uppercase font-bold">Cash Balance</p>
              <p className="text-base font-bold">${uiPortfolio.balance.toLocaleString()}</p>
            </div>
            <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
              <p className="text-[8px] text-muted-foreground mb-0.5 uppercase font-bold">Total P&L</p>
              <p className={`text-base font-bold ${uiPortfolio.overallPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                {uiPortfolio.overallPnL >= 0 ? '+' : ''}${Math.abs(uiPortfolio.overallPnL).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

          <div className="glass p-4 rounded-xl border border-white/5">
            <h3 className="text-xs font-bold flex items-center gap-2 mb-3">
              <PieChart className="w-3.5 h-3.5 text-primary" />
              Asset Allocation
            </h3>
            {(() => {
              const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];
              const CASH_COLOR = "#475569";

              const holdingsValue = uiPortfolio.holdings.reduce(
                (sum: number, h: any) => sum + h.quantity * h.currentPrice, 0
              );
              const totalValue = holdingsValue + uiPortfolio.balance;

              const items = [
                ...uiPortfolio.holdings.map((h: any, i: number) => ({
                  label: h.symbol,
                  value: h.quantity * h.currentPrice,
                  color: COLORS[i % COLORS.length],
                })),
                ...(uiPortfolio.balance > 0 ? [{
                  label: "Cash",
                  value: uiPortfolio.balance,
                  color: CASH_COLOR,
                }] : []),
              ].sort((a: any, b: any) => b.value - a.value);

              if (totalValue === 0) {
                return (
                  <div className="py-6 text-center text-[10px] text-muted-foreground">
                    No funds or holdings to display.
                  </div>
                );
              }

              let cumulative = 0;
              const gradientParts = items.map((item: any) => {
                const pct = (item.value / totalValue) * 100;
                const start = cumulative;
                cumulative += pct;
                return `${item.color} ${start}% ${cumulative}%`;
              });

              return (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-[110px] h-[110px] shrink-0">
                    <div
                      className="w-full h-full rounded-full"
                      style={{ background: `conic-gradient(${gradientParts.join(", ")})` }}
                    />
                    <div className="absolute inset-[16px] rounded-full bg-[#0b0c10] flex flex-col items-center justify-center">
                      <span className="text-[7px] text-muted-foreground font-bold uppercase tracking-wider">Total</span>
                      <span className="text-[11px] font-bold leading-tight">${totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full space-y-1.5">
                    {items.map((item: any) => {
                      const pct = (item.value / totalValue) * 100;
                      return (
                        <div key={item.label} className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-bold truncate">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-muted-foreground font-mono">${item.value.toLocaleString()}</span>
                            <span className="text-muted-foreground font-mono w-[38px] text-right">{pct.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
      </div>

      <div className="space-y-2.5">
        <h3 className="text-sm font-bold px-1">Individual Holdings</h3>
        <div className="glass rounded-xl border border-white/5 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-muted-foreground text-[8px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-4 py-2.5">Asset</th>
                  <th className="px-4 py-2.5 text-right">Quantity</th>
                  <th className="px-4 py-2.5 text-right">Avg Price</th>
                  <th className="px-4 py-2.5 text-right">Current Price</th>
                  <th className="px-4 py-2.5 text-right">P&L (%)</th>
                  <th className="px-4 py-2.5 text-center">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {uiPortfolio.holdings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-muted-foreground/40" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-muted-foreground">No holdings yet</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Start trading to build your portfolio.</p>
                        </div>
                        <Link href="/dashboard/trade">
                          <button className="inline-flex items-center gap-1 rounded-lg bg-primary/20 text-primary px-3 py-1.5 text-[10px] font-bold hover:bg-primary/30 transition-colors">
                            Browse Assets
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  uiPortfolio.holdings.map((h: any) => (
                    <tr key={h.symbol} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-4 py-3 font-bold text-sm">{h.symbol}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{h.quantity}</td>
                      <td className="px-4 py-3 text-right text-[11px] text-muted-foreground tracking-tighter">${h.avgBuyPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-bold">${h.currentPrice.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-bold text-[11px] ${h.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {h.pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {h.pnlPercent}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/dashboard/trade/${h.symbol}`}>
                          <button className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 hover:bg-primary/20 px-2.5 py-0.5 text-[10px] text-muted-foreground hover:text-primary transition-colors">
                            Trade
                            <ArrowUpRight className="w-2.5 h-2.5" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}