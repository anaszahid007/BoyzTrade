"use client";

import React from "react";
import { Lock, Zap, TrendingUp, Activity, BarChart3, Repeat, Key } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { motion } from "framer-motion";

interface GatedFeatureProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const FEATURE_META: Record<string, { name: string; description: string; icon: React.ReactNode; unlockLevel: number }> = {
  basic_trading: { name: "Basic Trading", description: "Standard market orders", icon: <Activity className="w-4 h-4" />, unlockLevel: 1 },
  advanced_charting: { name: "Advanced Charting", description: "Candlestick charts with technical indicators", icon: <BarChart3 className="w-4 h-4" />, unlockLevel: 2 },
  stop_loss: { name: "Stop Loss", description: "Set stop-loss orders to manage risk", icon: <TrendingUp className="w-4 h-4" />, unlockLevel: 3 },
  margin_trading: { name: "Margin Trading", description: "Trade with leverage up to 5x", icon: <Zap className="w-4 h-4" />, unlockLevel: 4 },
  limit_orders: { name: "Limit Orders", description: "Place limit buy/sell orders", icon: <Repeat className="w-4 h-4" />, unlockLevel: 5 },
  api_access: { name: "API Access", description: "Programmatic trading via REST API", icon: <Key className="w-4 h-4" />, unlockLevel: 6 },
};

export default function GatedFeature({ feature, children, fallback }: GatedFeatureProps) {
  const { profile } = useGamification();
  const isUnlocked = profile?.unlockedFeatures?.includes(feature) ?? false;
  const meta = FEATURE_META[feature];

  if (isUnlocked) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="relative group">
      <div className="blur-sm pointer-events-none select-none">{children}</div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg-dark/80 backdrop-blur-sm border border-white/10 max-w-[200px] text-center">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            {meta?.icon || <Lock className="w-4 h-4 text-muted-foreground" />}
          </div>
          <p className="text-[10px] font-bold">{meta?.name || feature}</p>
          <p className="text-[8px] text-muted-foreground">{meta?.description || "Feature locked"}</p>
          <div className="flex items-center gap-1 text-[8px] text-primary font-bold mt-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            <Lock className="w-2.5 h-2.5" />
            <span>Unlocks at Level {meta?.unlockLevel || "?"}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
