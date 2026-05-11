"use client";

import React, { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ArrowUpRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function PortfolioPage() {
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const getPortfolio = httpsCallable(functions, "getPortfolio");
        const result: any = await getPortfolio();
        setPortfolio(result.data);
      } catch (err) {
        console.error("Error fetching portfolio:", err);
        // Mock data for UI demo
        setPortfolio({
          balance: 8500.00,
          totalValue: 12450.75,
          overallPnL: 2450.75,
          overallPnLPercent: 24.5,
          holdings: [
            { symbol: "BTC", quantity: 0.05, avgBuyPrice: 55000, currentPrice: 65432, pnl: 521.60, pnlPercent: 18.9 },
            { symbol: "ETH", quantity: 1.2, avgBuyPrice: 2800, currentPrice: 3456, pnl: 787.20, pnlPercent: 23.4 },
            { symbol: "SOL", quantity: 15.5, avgBuyPrice: 85.20, currentPrice: 145.20, pnl: 930.00, pnlPercent: 70.4 },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Your <span className="gradient-text">Portfolio</span></h1>
        <p className="text-muted-foreground">Detailed overview of your virtual holdings and performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Card */}
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
           
           <div className="space-y-1 relative z-10">
             <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Total Net Worth</p>
             <h2 className="text-5xl font-bold tracking-tighter">${portfolio.totalValue.toLocaleString()}</h2>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-12 relative z-10">
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1 uppercase">Cash Balance</p>
                <p className="text-xl font-bold">${portfolio.balance.toLocaleString()}</p>
             </div>
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1 uppercase">Total P&L</p>
                <p className={`text-xl font-bold ${portfolio.overallPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                  {portfolio.overallPnL >= 0 ? '+' : ''}${Math.abs(portfolio.overallPnL).toLocaleString()}
                </p>
             </div>
           </div>
        </div>

        {/* Breakdown Summary */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
           <h3 className="font-bold flex items-center gap-2">
             <PieChart className="w-5 h-5 text-primary" />
             Asset Allocation
           </h3>
           <div className="space-y-4">
             {portfolio.holdings.map((h: any) => (
               <div key={h.symbol} className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="font-medium">{h.symbol}</span>
                   <span className="text-muted-foreground">{((h.quantity * h.currentPrice / portfolio.totalValue) * 100).toFixed(1)}%</span>
                 </div>
                 <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-primary neon-glow-blue" 
                    style={{ width: `${(h.quantity * h.currentPrice / portfolio.totalValue) * 100}%` }}
                   />
                 </div>
               </div>
             ))}
           </div>
           <div className="pt-4 border-t border-white/5 flex items-center gap-3">
              <Info className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Portfolio is automatically rebalanced based on live market prices.</p>
           </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold px-1">Individual Holdings</h3>
        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-muted-foreground text-xs uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4 text-right">Quantity</th>
                  <th className="px-6 py-4 text-right">Avg Price</th>
                  <th className="px-6 py-4 text-right">Current Price</th>
                  <th className="px-6 py-4 text-right">P&L (%)</th>
                  <th className="px-6 py-4 text-center">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {portfolio.holdings.map((h: any) => (
                  <tr key={h.symbol} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5 font-bold text-lg">{h.symbol}</td>
                    <td className="px-6 py-5 text-right font-mono">{h.quantity}</td>
                    <td className="px-6 py-5 text-right text-muted-foreground">${h.avgBuyPrice.toLocaleString()}</td>
                    <td className="px-6 py-5 text-right font-mono font-medium">${h.currentPrice.toLocaleString()}</td>
                    <td className={`px-6 py-5 text-right font-bold ${h.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {h.pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {h.pnlPercent}%
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Link href={`/trade?asset=${h.symbol}`}>
                        <Button variant="ghost" className="p-2 h-auto">
                           <ArrowUpRight className="w-5 h-5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
