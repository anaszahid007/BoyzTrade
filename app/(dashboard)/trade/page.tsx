"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePrices } from "@/hooks/usePrices";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { 
  ArrowRightLeft, 
  TrendingUp, 
  Wallet, 
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function TradePage() {
  const searchParams = useSearchParams();
  const initialAsset = searchParams.get("asset") || "BTC";
  
  const { prices, loading: pricesLoading } = usePrices();
  const [selectedAsset, setSelectedAsset] = useState(initialAsset);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const currentAssetData = prices.find((p) => p.symbol === selectedAsset);
  const currentPrice = currentAssetData?.price || 0;

  useEffect(() => {
    if (initialAsset) setSelectedAsset(initialAsset);
  }, [initialAsset]);

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const functionName = tradeType === "BUY" ? "executeBuy" : "executeSell";
      const tradeFn = httpsCallable(functions, functionName);
      
      const payload = tradeType === "BUY" 
        ? { asset: selectedAsset, usdAmount: parseFloat(amount) }
        : { asset: selectedAsset, quantity: parseFloat(amount) };

      const result: any = await tradeFn(payload);

      if (result.data.success) {
        setStatus({
          type: "success",
          message: `Successfully ${tradeType === "BUY" ? "bought" : "sold"} ${selectedAsset}!`
        });
        setAmount("");
      }
    } catch (err: any) {
      console.error("Trade error:", err);
      setStatus({
        type: "error",
        message: err.message || "An error occurred during the trade."
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatedOutput = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || !currentPrice) return "0.00";
    return tradeType === "BUY" 
      ? (val / currentPrice).toFixed(8) 
      : (val * currentPrice).toFixed(2);
  };

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
                    {tradeType === "BUY" ? "Spend USD" : `Sell ${selectedAsset}`}
                  </label>
                  <span className="text-xs text-primary font-medium">Balance: $10,000.00</span>
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
                    {tradeType === "BUY" ? "USD" : selectedAsset}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">
                  You will {tradeType === "BUY" ? "receive" : "receive approximately"}
                </label>
                <div className="h-16 flex items-center px-6 glass rounded-xl border border-white/10 bg-white/5 font-mono text-2xl font-bold">
                  {calculatedOutput()} <span className="ml-2 text-muted-foreground text-sm uppercase">{tradeType === "BUY" ? selectedAsset : "USD"}</span>
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
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground italic">Connect your portfolio to see your holdings here.</p>
              <Link href="/portfolio">
                <Button variant="ghost" className="mt-4 text-xs">View Full Portfolio</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
