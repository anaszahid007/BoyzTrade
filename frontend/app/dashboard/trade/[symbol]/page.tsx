"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useSocket } from "@/contexts/SocketContext";
import { tradeService, AssetSummary } from "@/lib/trade";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Zap,
  Info,
} from "lucide-react";
import Link from "next/link";

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

    setStatus(null);
    setIsSubmitting(true);

    try {
      const quantity = parseFloat(amount);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error("Enter a valid quantity to trade.");
      }

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Asset not found</h1>
          <p className="text-muted-foreground">Could not find {symbol} in the market.</p>
        </div>
        <Button onClick={() => router.back()} variant="primary">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{asset.symbol}</h1>
          <p className="text-muted-foreground">{asset.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Chart & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Card */}
          <div className="glass p-8 rounded-4xl border border-white/5">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Market Price</p>
                  <h2 className="text-5xl font-bold">
                    ${currentPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h2>
                </div>
                <div
                  className={`rounded-3xl px-4 py-2 flex items-center gap-2 font-bold text-sm ${
                    isPositive
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {isPositive ? "+" : ""}{priceChange24h.toFixed(2)}%
                </div>
              </div>

              {/* Simple Price Chart - Placeholder for enhanced chart */}
              <div className="bg-black/40 rounded-2xl p-6 border border-white/5 min-h-80 flex flex-col items-center justify-center">
                <BarChart3 className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-center">
                  Real-time chart integration coming soon
                  <br />
                  <span className="text-xs text-muted-foreground/50">
                    Current Price: ${currentPrice.toFixed(2)}
                  </span>
                </p>
              </div>

              {/* 24h Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    24h Change
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      isPositive ? "text-success" : "text-danger"
                    }`}
                  >
                    {priceChange24h.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Market Cap
                  </p>
                  <p className="text-lg font-bold">
                    ${(asset.market_cap / 1e9).toFixed(2)}B
                  </p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Your Holdings
                  </p>
                  <p className="text-lg font-bold">
                    {assetHolding?.quantity.toFixed(4) || "0"} {asset.symbol}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Info */}
          <div className="glass p-6 rounded-4xl border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Asset Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Symbol
                </p>
                <p className="text-lg font-bold">{asset.symbol}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Name
                </p>
                <p className="text-lg font-bold">{asset.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Current Price
                </p>
                <p className="text-lg font-bold font-mono">
                  ${currentPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Market Cap
                </p>
                <p className="text-lg font-bold">
                  ${(asset.market_cap / 1e9).toFixed(2)}B
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Trade Form */}
        <div className="space-y-6">
          {/* Trade Card */}
          <div className="glass p-8 rounded-4xl border border-white/5 sticky top-6">
            <form onSubmit={handleTrade} className="space-y-6">
              {/* Buy/Sell Toggle */}
              <div className="flex gap-2 bg-secondary/50 rounded-3xl p-1 border border-border/50">
                <button
                  type="button"
                  onClick={() => setTradeType("BUY")}
                  className={`flex-1 rounded-3xl py-3 text-sm font-bold transition-all ${
                    tradeType === "BUY"
                      ? "bg-success text-white shadow-lg neon-glow-green"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowDownIcon className="w-4 h-4" />
                    Buy
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType("SELL")}
                  className={`flex-1 rounded-3xl py-3 text-sm font-bold transition-all ${
                    tradeType === "SELL"
                      ? "bg-danger text-white shadow-lg neon-glow-red"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowUpIcon className="w-4 h-4" />
                    Sell
                  </span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">
                    {tradeType === "BUY" ? "Buy Amount" : "Sell Amount"}
                  </label>
                  <span className="text-xs text-primary font-medium">
                    {tradeType === "BUY"
                      ? `Available: $${availableBalance.toLocaleString()}`
                      : `Holding: ${assetHolding?.quantity.toFixed(4) || "0"} ${symbol}`}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-xl h-14 font-mono pr-16"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                    {symbol}
                  </div>
                </div>
              </div>

              {/* Quick Percentage Buttons */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Quick Select
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[0.25, 0.5, 0.75, 1].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() =>
                        setAmount((maxSpendable * ratio).toFixed(6))
                      }
                      className="text-xs px-2 py-2 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/20 rounded-lg text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      {ratio * 100}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3 bg-black/40 rounded-2xl p-4 border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {tradeType === "BUY" ? "Total Cost" : "Total Receive"}
                  </span>
                  <span className="font-bold text-lg">
                    ${estimatedValue()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Price per {symbol}</span>
                  <span className="font-mono">
                    ${currentPrice.toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Quantity
                  </span>
                  <span className="font-medium">
                    {parseFloat(amount) || "0"} {symbol}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              {status && (
                <div
                  className={`rounded-2xl p-4 border ${
                    status.type === "success"
                      ? "bg-success/10 border-success/20 text-success"
                      : "bg-danger/10 border-danger/20 text-danger"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {status.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0" />
                    )}
                    <p className="text-sm font-medium">{status.message}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant={tradeType === "BUY" ? "primary" : "danger"}
                className="w-full py-4 text-base font-bold"
                isLoading={isSubmitting}
              >
                {tradeType === "BUY" ? (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Place Buy Order
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Place Sell Order
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Holdings Summary */}
          {assetHolding && (
            <div className="glass p-6 rounded-4xl border border-white/5">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-success" />
                Your Holdings
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Quantity
                  </span>
                  <span className="font-bold">
                    {assetHolding.quantity.toFixed(4)} {symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Current Value
                  </span>
                  <span className="font-bold">
                    ${assetHolding.current_value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">P&L</span>
                  <span
                    className={`font-bold ${
                      Number(assetHolding.profit_loss) >= 0
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {Number(assetHolding.profit_loss) >= 0 ? "+" : ""}
                    ${assetHolding.profit_loss.toFixed(2)} (
                    {assetHolding.profit_loss_percentage}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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
