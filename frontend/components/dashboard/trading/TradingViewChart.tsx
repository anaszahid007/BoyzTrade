"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Maximize2, Minimize2, RefreshCw } from "lucide-react";

declare global {
  interface Window {
    TradingView: {
      widget: new (config: Record<string, any>) => { remove: () => void };
    };
  }
}

interface TradingViewChartProps {
  symbol: string;
}

const SPECIAL_SYMBOLS: Record<string, string> = {
  PEPE: "BINANCE:1000PEPEUSDT",
  SHIB: "BINANCE:1000SHIBUSDT",
  XEC: "BINANCE:1000XECUSDT",
  FLOKI: "BINANCE:1000FLOKIUSDT",
  BTT: "BINANCE:1000BTTUSDT",
  WIN: "BINANCE:1000WINUSDT",
};

const EXCHANGES = [
  (s: string) => `COINBASE:${s}USD`,   // USD preferred — shown by default
  (s: string) => `BINANCE:${s}USDT`,   // fallback 1
  (s: string) => `BYBIT:${s}USDT`,     // fallback 2
  (s: string) => `KUCOIN:${s}USDT`,    // fallback 3
];

const INTERVALS = [
  { label: "1m",  value: "1",   tip: "1 Minute" },
  { label: "5m",  value: "5",   tip: "5 Minutes" },
  { label: "15m", value: "15",  tip: "15 Minutes" },
  { label: "1h",  value: "60",  tip: "1 Hour" },
  { label: "4h",  value: "240", tip: "4 Hours" },
  { label: "1D",  value: "D",   tip: "1 Day" },
  { label: "1W",  value: "W",   tip: "1 Week" },
];

/** Normal chart height in px */
const CHART_H_NORMAL   = 520;
/** Expanded height — grows in-place so sidebar is NEVER covered */
const CHART_H_EXPANDED = 800;

export default function TradingViewChart({ symbol }: TradingViewChartProps) {
  const s           = symbol.toUpperCase();
  const isStablecoin = s === "USDT" || s === "USDC" || s === "DAI" || s === "BUSD";

  const containerRef  = useRef<HTMLDivElement>(null);
  const widgetRef     = useRef<any>(null);
  /** Tracks whether tv.js script has been injected into <head> */
  const scriptInjectedRef = useRef(false);

  /**
   * IMPORTANT: start at -1 so no widget is built before the script is ready.
   * We only advance to 0 inside script.onload, guaranteeing one build per load.
   */
  const [attemptIndex, setAttemptIndex] = useState(isStablecoin ? -2 : -1);
  const [interval,     setInterval]     = useState("60");
  const [expanded,     setExpanded]     = useState(false);
  const [loading,      setLoading]      = useState(!isStablecoin);

  // ── Helper: destroy old widget and build a new one ──────────────────────
  const buildWidget = useCallback((idx: number, iv: string, isExpanded: boolean) => {
    if (idx < 0 || !containerRef.current || !window.TradingView) return;

    if (widgetRef.current) {
      try { widgetRef.current.remove(); } catch {}
      widgetRef.current = null;
    }

    const fmt = EXCHANGES[idx];
    const sym = SPECIAL_SYMBOLS[s] || fmt(s);
    const h   = isExpanded ? CHART_H_EXPANDED : CHART_H_NORMAL;

    setLoading(true);

    widgetRef.current = new window.TradingView.widget({
      container_id:        containerRef.current.id,
      symbol:              sym,
      interval:            iv,
      timezone:            "exchange",
      theme:               "dark",
      style:               "1",
      locale:              "en",
      toolbar_bg:          "#0b0c10",
      enable_publishing:   false,
      hide_side_toolbar:   false,
      allow_symbol_change: false,
      save_image:          false,
      width:               "100%",
      height:              h,   // ← explicit px; never collapses
      studies:             ["STD;RSI"],
      backgroundColor:     "#050505",
      gridColor:           "rgba(255,255,255,0.05)",
      loading_screen:      { backgroundColor: "#0b0c10", foregroundColor: "#6366f1" },
    });

    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, [s]);

  // ── Inject tv.js script once ─────────────────────────────────────────────
  useEffect(() => {
    if (isStablecoin || scriptInjectedRef.current) return;
    scriptInjectedRef.current = true;

    const existing = document.querySelector('script[src*="tradingview.com/tv.js"]');
    if (existing) {
      // Script already present (e.g. hot-reload), go straight to building
      setAttemptIndex(0);
      return;
    }

    const script   = document.createElement("script");
    script.src     = "https://s3.tradingview.com/tv.js";
    script.async   = true;
    // Only now (after the script has actually loaded) do we move to 0.
    script.onload  = () => setAttemptIndex(0);
    document.head.appendChild(script);
  }, [isStablecoin]);

  // ── Rebuild when exchange attempt changes or interval changes ────────────
  useEffect(() => {
    return buildWidget(attemptIndex, interval, expanded) as any;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptIndex, interval]);

  // ── Rebuild when expanded changes (different height passed to TV) ────────
  useEffect(() => {
    if (attemptIndex < 0) return; // widget hasn't been created yet
    return buildWidget(attemptIndex, interval, expanded) as any;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  // ── Auto-retry with next exchange ONLY if still loading after 7 s ────────
  useEffect(() => {
    if (attemptIndex < 0 || attemptIndex >= EXCHANGES.length - 1) return;
    if (!loading) return; // chart resolved fine — don't advance

    const timer = setTimeout(() => setAttemptIndex((i) => i + 1), 7000);
    return () => clearTimeout(timer);
  }, [attemptIndex, loading]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      // E — toggle expand in place
      if (e.key === "e" || e.key === "E") setExpanded((v) => !v);
      // Arrow keys — cycle intervals
      if (e.key === "ArrowRight") {
        setInterval((cur) => {
          const idx = INTERVALS.findIndex((iv) => iv.value === cur);
          return INTERVALS[Math.min(idx + 1, INTERVALS.length - 1)].value;
        });
      }
      if (e.key === "ArrowLeft") {
        setInterval((cur) => {
          const idx = INTERVALS.findIndex((iv) => iv.value === cur);
          return INTERVALS[Math.max(idx - 1, 0)].value;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    // Force a re-build by resetting to exchange 0
    setAttemptIndex((prev) => {
      if (prev === 0) {
        // trigger the effect even if already 0 by toggling interval briefly
        buildWidget(0, interval, expanded);
        return 0;
      }
      return 0;
    });
    setInterval("60");
  }, [buildWidget, interval, expanded]);

  // ── Unavailable ──────────────────────────────────────────────────────────
  if (isStablecoin || attemptIndex >= EXCHANGES.length) {
    return (
      <div
        style={{ height: CHART_H_NORMAL }}
        className="bg-black/40 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-3"
      >
        <p className="text-muted-foreground text-xs">Chart unavailable for {symbol}</p>
        {attemptIndex >= EXCHANGES.length && (
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    );
  }

  const chartHeight = expanded ? CHART_H_EXPANDED : CHART_H_NORMAL;

  // ── Chart ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        {/* Interval pills */}
        <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/10">
          {INTERVALS.map((iv) => (
            <button
              key={iv.value}
              type="button"
              title={iv.tip}
              onClick={() => setInterval(iv.value)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                interval === iv.value
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              {iv.label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          {/* Keyboard hint */}
          <span className="hidden sm:flex items-center gap-1 text-[9px] text-muted-foreground/50 select-none">
            <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded text-[8px]">←</kbd>
            <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded text-[8px]">→</kbd>
            interval
            <span className="mx-1">·</span>
            <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded text-[8px]">E</kbd>
            expand
          </span>

          {/* Reload */}
          <button
            type="button"
            title="Reload chart"
            onClick={handleRetry}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </button>

          {/* Expand / collapse — in-place, sidebar stays untouched */}
          <button
            type="button"
            title={expanded ? "Collapse chart (E)" : "Expand chart (E)"}
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Chart container — height transitions smoothly in place */}
      <div
        className="relative rounded-xl overflow-hidden transition-[height] duration-300"
        style={{ height: chartHeight }}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 rounded-xl bg-[#0b0c10] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-[10px] text-muted-foreground">Loading chart…</p>
            </div>
          </div>
        )}
        <div
          id={`tv_chart_${s}`}
          ref={containerRef}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
