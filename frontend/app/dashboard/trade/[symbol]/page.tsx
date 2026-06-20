"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useSocket } from "@/contexts/SocketContext";
import { tradeService, AssetSummary } from "@/services/trade";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import GatedFeature from "@/components/ui/GatedFeature";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Zap,
  Info,
  X,
} from "lucide-react";

const TradingViewChart = dynamic(
  () => import("@/components/dashboard/trading/TradingViewChart"),
  { ssr: false }
);

const formatPrice = (price: number) => {
  if (!price) return "0.00";
  if (price < 0.01) {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  }
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function AssetTradeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const symbol = (params.symbol as string)?.toUpperCase() || "BTC";

  const { portfolio } = usePortfolio();
  const { socket } = useSocket();
  const [asset, setAsset] = useState<AssetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch asset details
  useEffect(() => {
    async function fetchAsset() {
      setLoading(true);
      try {
        const data = await tradeService.getAssetBySymbol(symbol);
        setAsset(data);
      } catch (error) {
        console.error("Failed to load asset", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAsset();
  }, [symbol]);

  useEffect(() => {
    if (!socket) return;

    const handlePriceUpdate = (assets: any[]) => {
      const updatedAsset = assets.find((item) => item.symbol === symbol);
      if (!updatedAsset) return;

      setAsset((current) =>
        current
          ? {
              ...current,
              current_price: updatedAsset.current_price ?? current.current_price,
              price_change_24h:
                updatedAsset.price_change_24h ?? current.price_change_24h,
              market_cap: updatedAsset.market_cap ?? current.market_cap,
              last_updated: updatedAsset.last_updated ?? current.last_updated,
            }
          : {
              ...updatedAsset,
              symbol,
            }
      );
    };

    socket.on("price-update", handlePriceUpdate);
    return () => {
      socket.off("price-update", handlePriceUpdate);
    };
  }, [socket, symbol]);

  const assetHolding = useMemo(
    () => portfolio?.holdings.find((h) => h.symbol === symbol) ?? null,
    [portfolio, symbol]
  );

  const currentPrice = asset?.current_price || 0;
  const availableBalance = portfolio?.cash_balance || 0;
  const priceChange24h = asset?.price_change_24h ?? 0;
  const isPositive = priceChange24h >= 0;

  const maxSpendable =
    tradeType === "BUY"
      ? availableBalance / (currentPrice || 1)
      : assetHolding?.quantity || 0;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    const quantity = parseFloat(amount);
    if (isNaN(quantity) || quantity <= 0) {
      setStatus({ type: "error", message: "Enter a valid quantity to trade." });
      return;
    }
    setShowConfirm(true);
  };

  const executeTrade = async () => {
    if (!asset) return;
    setShowConfirm(false);
    setStatus(null);
    setIsSubmitting(true);

    const quantity = parseFloat(amount);

    try {
      if (tradeType === "BUY") {
        await tradeService.buyAsset(asset.symbol, quantity);
      } else {
        await tradeService.sellAsset(asset.symbol, quantity);
      }

      setStatus({
        type: "success",
        message: `Successfully ${tradeType === "BUY" ? "bought" : "sold"} ${quantity} ${asset.symbol}!`,
      });
      setAmount("");
    } catch (err: any) {
      console.error("Trade error:", err);
      setStatus({
        type: "error",
        message: err.message || "An error occurred during the trade.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedValue = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return "0.00";
    return (val * currentPrice).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-bold">Asset not found</h1>
          <p className="text-xs text-muted-foreground">Could not find {symbol} in the market.</p>
        </div>
        <Button onClick={() => router.back()} variant="primary">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{asset.symbol}</h1>
          <p className="text-[11px] text-muted-foreground">{asset.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass p-4 rounded-xl border border-white/5">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Market Price</p>
                  <h2 className="text-3xl font-bold">
                    ${formatPrice(currentPrice)}
                  </h2>
                </div>
                <div
                  className={`rounded-xl px-3 py-1.5 flex items-center gap-1.5 font-bold text-[11px] ${
                    isPositive
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {isPositive ? "+" : ""}{priceChange24h.toFixed(2)}%
                </div>
              </div>

              {/* <GatedFeature feature="advanced_charting"> */}
                <TradingViewChart symbol={symbol} />
              {/* </GatedFeature> */}

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">24h Change</p>
                  <p className={`text-sm font-bold ${isPositive ? "text-success" : "text-danger"}`}>
                    {priceChange24h.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Market Cap</p>
                  <p className="text-sm font-bold">${(asset.market_cap / 1e9).toFixed(2)}B</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Your Holdings</p>
                  <p className="text-sm font-bold">{typeof assetHolding?.quantity === 'number' ? assetHolding.quantity.toFixed(4) : "0"} {asset.symbol}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-4 rounded-xl border border-white/5">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary" />
              Asset Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Symbol</p>
                <p className="text-sm font-bold">{asset.symbol}</p>
              </div>
              <div>
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Name</p>
                <p className="text-sm font-bold">{asset.name}</p>
              </div>
              <div>
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Current Price</p>
                <p className="text-sm font-bold font-mono">${formatPrice(currentPrice)}</p>
              </div>
              <div>
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Market Cap</p>
                <p className="text-sm font-bold">${(asset.market_cap / 1e9).toFixed(2)}B</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sticky top-6 h-fit">
          <div className="glass p-4 rounded-xl border border-white/5">
            <form onSubmit={handleTrade} className="space-y-3">
              <div className="flex gap-1.5 bg-secondary/50 rounded-xl p-0.5 border border-border/50">
                <button
                  type="button"
                  onClick={() => setTradeType("BUY")}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                    tradeType === "BUY"
                      ? "bg-success text-white shadow-lg neon-glow-green"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    <ArrowDownIcon className="w-3 h-3" />
                    Buy
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType("SELL")}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                    tradeType === "SELL"
                      ? "bg-danger text-white shadow-lg neon-glow-red"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    <ArrowUpIcon className="w-3 h-3" />
                    Sell
                  </span>
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-medium text-muted-foreground">
                    {tradeType === "BUY" ? "Buy Amount" : "Sell Amount"}
                  </label>
                  <span className="text-[9px] text-primary font-medium">
                    {tradeType === "BUY"
                      ? `Available: $${availableBalance.toLocaleString()}`
                      : `Holding: ${typeof assetHolding?.quantity === 'number' ? assetHolding.quantity.toFixed(4) : "0"} ${symbol}`}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-base h-10 font-mono pr-14"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-[10px]">
                    {symbol}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Quick Select</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0.25, 0.5, 0.75, 1].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() =>
                        setAmount((maxSpendable * ratio).toFixed(6))
                      }
                      className="text-[9px] px-1.5 py-1.5 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/20 rounded-lg text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      {ratio * 100}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 bg-black/40 rounded-lg p-3 border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-muted-foreground">{tradeType === "BUY" ? "Total Cost" : "Total Receive"}</span>
                  <span className="font-bold text-sm">${estimatedValue()}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                  <span>Price per {symbol}</span>
                  <span className="font-mono">${formatPrice(currentPrice)}</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-muted-foreground">Quantity</span>
                  <span className="font-medium text-xs">{parseFloat(amount) || "0"} {symbol}</span>
                </div>
              </div>

              {status && (
                <div className={`rounded-lg p-3 border ${
                  status.type === "success"
                    ? "bg-success/10 border-success/20 text-success"
                    : "bg-danger/10 border-danger/20 text-danger"
                }`}>
                  <div className="flex items-center gap-2">
                    {status.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <p className="text-[11px] font-medium">{status.message}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant={tradeType === "BUY" ? "primary" : "danger"}
                className="w-full py-3 text-sm font-bold"
                isLoading={isSubmitting}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  {tradeType === "BUY" ? "Place Buy Order" : "Place Sell Order"}
                </span>
              </Button>
            </form>
          </div>

          {assetHolding && (
            <div className="glass p-4 rounded-xl border border-white/5">
              <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-success" />
                Your Holdings
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">Quantity</span>
                  <span className="font-bold text-xs">{assetHolding.quantity.toFixed(4)} {symbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">Current Value</span>
                  <span className="font-bold text-xs">
                    ${assetHolding.current_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">P&L</span>
                  <span className={`font-bold text-xs ${Number(assetHolding.profit_loss) >= 0 ? "text-success" : "text-danger"}`}>
                    {Number(assetHolding.profit_loss) >= 0 ? "+" : ""}${assetHolding.profit_loss.toFixed(2)} ({assetHolding.profit_loss_percentage}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trade Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0b0c10] border border-white/10 rounded-xl shadow-2xl w-full max-w-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Confirm {tradeType === "BUY" ? "Buy" : "Sell"} Order</h3>
              <button onClick={() => setShowConfirm(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 bg-black/40 rounded-lg p-3 border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Asset</span>
                <span className="font-bold text-xs">{symbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Type</span>
                <span className={`font-bold text-xs ${tradeType === "BUY" ? "text-success" : "text-danger"}`}>{tradeType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Quantity</span>
                <span className="font-bold text-xs">{parseFloat(amount)} {symbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Price per {symbol}</span>
                <span className="font-mono text-xs">${formatPrice(currentPrice)}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Total {tradeType === "BUY" ? "Cost" : "Receive"}</span>
                <span className="font-bold text-sm">${estimatedValue()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-white/10 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeTrade}
                className={`flex-1 py-2 rounded-lg text-xs font-bold text-white transition-colors ${
                  tradeType === "BUY"
                    ? "bg-success hover:bg-success/80"
                    : "bg-danger hover:bg-danger/80"
                }`}
              >
                Confirm {tradeType === "BUY" ? "Buy" : "Sell"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple arrow icons since they're not in lucide
function ArrowDownIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}
