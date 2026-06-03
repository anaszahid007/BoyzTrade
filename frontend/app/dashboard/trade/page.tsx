"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePrices } from "@/hooks/usePrices";
import { usePortfolio } from "@/hooks/usePortfolio";
import { tradeService } from "@/lib/trade";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  ArrowRightLeft,
  TrendingUp,
  Wallet,
  Info,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function TradePage() {
  const searchParams = useSearchParams();
  const initialAsset = searchParams.get("asset") || "BTC";

  const { prices } = usePrices();
  const { portfolio, refresh: refreshPortfolio } = usePortfolio();
  
  const [selectedAsset, setSelectedAsset] = useState(initialAsset);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const currentAssetData = prices.find((p) => p.symbol === selectedAsset);
  const currentPrice = currentAssetData?.price || 0;

  // Find user holding for selected asset
  const assetHolding = portfolio?.holdings.find(h => h.symbol === selectedAsset);

  useEffect(() => {
    if (initialAsset) setSelectedAsset(initialAsset);
  }, [initialAsset]);

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const quantity = parseFloat(amount);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error("Enter a valid quantity to trade.");
      }

      let result;
      if (tradeType === "BUY") {
        result = await tradeService.buyAsset(selectedAsset, quantity);
      } else {
        result = await tradeService.sellAsset(selectedAsset, quantity);
      }

      setStatus({
        type: "success",
        message: `Successfully ${tradeType === "BUY" ? "bought" : "sold"} ${quantity} ${selectedAsset}!`,
      });
      setAmount("");
      // refreshPortfolio(); // No longer needed as WebSockets handle this
    } catch (err: any) {
      console.error("Trade error:", err);
      setStatus({
        type: "error",
        message: err.message || "An error occurred during the trade.",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatedOutput = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || !currentPrice) return "0.00";
    
    // If buying, user enters quantity of asset they want to buy
    // If selling, user enters quantity of asset they want to sell
    // In both cases, the output is the USD value
    return (val * currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const availableBalance = portfolio?.cash_balance || 0;
  const maxSpendable = tradeType === "BUY" ? availableBalance / (currentPrice || 1) : (assetHolding?.quantity || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Execute <span className="gradient-text">Trade</span></h1>
        <p className="text-muted-foreground">Exchange your virtual USD for crypto assets instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Trade Form */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden">
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 rounded-full transition-colors duration-500 ${tradeType === 'BUY' ? 'bg-success' : 'bg-danger'}`} />

            <div className="flex p-1 bg-secondary/50 rounded-2xl mb-8 border border-border/50">
              <button
                onClick={() => setTradeType("BUY")}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${tradeType === "BUY" ? "bg-success text-white shadow-lg neon-glow-green" : "text-muted-foreground hover:text-foreground"}`}
              >
                BUY
              </button>
              <button
                onClick={() => setTradeType("SELL")}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${tradeType === "SELL" ? "bg-danger text-white shadow-lg neon-glow-red" : "text-muted-foreground hover:text-foreground"}`}
              >
                SELL
              </button>
            </div>

            <form onSubmit={handleTrade} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Select Asset</label>
                <div className="grid grid-cols-5 gap-2">
                  {["BTC", "ETH", "SOL", "DOGE", "ADA"].map((symbol) => (
                    <button
                      key={symbol}
                      type="button"
                      onClick={() => setSelectedAsset(symbol)}
                      className={`
                        py-3 rounded-xl border font-bold transition-all
                        ${selectedAsset === symbol 
                          ? "bg-primary/20 border-primary text-primary neon-glow-blue" 
                          : "bg-card border-border text-muted-foreground hover:border-border-hover"}
                      `}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    {tradeType === "BUY" ? `Buy ${selectedAsset}` : `Sell ${selectedAsset}`}
                  </label>
                  <span className="text-xs text-primary font-medium">
                    {tradeType === "BUY" ? `Available: $${availableBalance.toLocaleString()}` : `Holding: ${assetHolding?.quantity || 0} ${selectedAsset}`}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-2xl h-16 font-mono"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                    {selectedAsset}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  {[0.25, 0.5, 0.75, 1].map((percent) => (
                    <button
                      key={percent}
                      type="button"
                      onClick={() => setAmount((maxSpendable * percent).toFixed(6))}
                      className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md text-muted-foreground transition-colors"
                    >
                      {percent * 100}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">
                  Estimated {tradeType === "BUY" ? "Cost" : "Receive"}
                </label>
                <div className="h-16 flex items-center px-6 glass rounded-xl border border-white/10 bg-white/5 font-mono text-2xl font-bold">
                  <span className="text-muted-foreground text-sm mr-2">USD</span> ${calculatedOutput()}
                </div>
              </div>

              {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border ${status.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <p className="text-sm font-medium">{status.message}</p>
                </div>
              )}

              <Button
                type="submit"
                variant={tradeType === "BUY" ? "primary" : "danger"}
                className="w-full py-5 text-xl font-bold"
                isLoading={loading}
              >
                {tradeType === "BUY" ? "Place Buy Order" : "Place Sell Order"}
              </Button>
            </form>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-6">
            <h4 className="font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Live Market Data
            </h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Price</span>
                <span className="font-mono font-bold text-lg">${currentPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Asset</span>
                <span className="font-bold">{selectedAsset}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary/80 leading-relaxed">
                  Prices are updated every 30 seconds. Your trade will be executed at the current market rate inside a secure Firestore Transaction.
                </p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-success" />
              Your Holdings
            </h4>
            <div className="space-y-4">
              {portfolio?.holdings && portfolio.holdings.length > 0 ? (
                <div className="space-y-3">
                  {portfolio.holdings.slice(0, 5).map((h) => (
                    <div key={h.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold border border-border">
                          {h.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{h.symbol}</p>
                          <p className="text-[10px] text-muted-foreground">{h.quantity} units</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-bold">${h.current_value.toLocaleString()}</p>
                        <p className={`text-[10px] font-medium ${Number(h.profit_loss) >= 0 ? 'text-success' : 'text-danger'}`}>
                          {Number(h.profit_loss) >= 0 ? '+' : ''}{h.profit_loss_percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                  {portfolio.holdings.length > 5 && (
                    <p className="text-center text-[10px] text-muted-foreground">And {portfolio.holdings.length - 5} more assets...</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground italic">No holdings yet. Start trading to see them here.</p>
                </div>
              )}
              
              <Link href="/dashboard/portfolio" className="block">
                <Button variant="ghost" className="w-full mt-2 text-xs group">
                  View Full Portfolio
                  <ArrowUpRight className="w-3 h-3 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
