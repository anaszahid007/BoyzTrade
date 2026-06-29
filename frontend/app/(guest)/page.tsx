"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  MousePointer2,
  Activity,
  BarChart3,
  ShieldCheck,
  Zap,
  Users,
  Timer,
  Globe,
  Quote,
  Star,
  Wallet,
  CandlestickChart,
  Target,
  BookOpen,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRef } from "react";

const topAssets = [
  { symbol: "BTC", name: "Bitcoin", price: 67432, change: 2.41, sparkline: [65, 68, 64, 70, 72, 69, 74, 76] },
  { symbol: "ETH", name: "Ethereum", price: 3456, change: 1.82, sparkline: [32, 34, 33, 36, 35, 37, 38, 36] },
  { symbol: "SOL", name: "Solana", price: 143.28, change: -0.63, sparkline: [14, 15, 13, 12, 14, 13, 14, 14] },
  { symbol: "AVAX", name: "Avalanche", price: 38.92, change: 5.14, sparkline: [3.5, 3.8, 3.6, 4.0, 3.9, 4.1, 4.3, 4.5] },
];

const features = [
  {
    icon: Zap,
    title: "Real-Time Execution",
    desc: "Orders execute instantly against live market data from CoinGecko. Experience real trading conditions without the risk.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Analytics",
    desc: "Track P&L, asset allocation, and performance metrics with professional-grade dashboards and historical data.",
  },
  {
    icon: ShieldCheck,
    title: "Risk-Free Learning",
    desc: "Start with $2500 in virtual capital. Every strategy, every mistake — learned without losing real money.",
  },
  {
    icon: CandlestickChart,
    title: "Pro-Grade Charts",
    desc: "Analyze markets with TradingView-powered charts. Identify trends, set entries, and refine your technical analysis.",
  },
];

const testimonials = [
  {
    name: "Alex Chen",
    handle: "@alex_chen",
    avatar: "AC",
    quote: "I spent 3 months on BoyzTrade before opening a real exchange account. By then I'd already developed a working strategy. Best decision I ever made.",
    achievement: "Built 23% ROI strategy in 8 weeks",
  },
  {
    name: "Sarah Mitchell",
    handle: "@sarah_m",
    avatar: "SM",
    quote: "The simulated environment is shockingly realistic. Same charts, same order types, same market moves. Only difference? No real losses while learning.",
    achievement: "Placed 500+ simulated trades",
  },
  {
    name: "Marcus Rivera",
    handle: "@marcus_r",
    avatar: "MR",
    quote: "I came in knowing nothing about crypto. The $10k virtual fund gave me the confidence to actually start. Now I manage my own portfolio IRL.",
    achievement: "Zero to funded trader in 6 months",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
};



function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-7" fill="none">
      <polyline points={points} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}


function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: useTransform(scrollYProgress, [0, 0.5], [1, 0]) }}>
        <div className="absolute top-[-20%] right-[-10%] w-[45%] h-[45%] bg-success/8 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-primary/5 blur-[140px] rounded-full" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 pt-20 pb-20 lg:pt-24 lg:pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
            <motion.div className="space-y-8">

            <motion.h1 {...fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.92]">
              <span className="text-muted-foreground">$2500 Virtual.</span><br />
              <span>Real Markets.</span><br />
              <span className="text-success">Zero Risk.</span>
            </motion.h1>

            <motion.p {...fadeUp} className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Practice crypto trading with real-time market data, professional-grade tools, and a funded virtual account. No deposit. No risk. Just skill building.
            </motion.p>

            <motion.div {...fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button className="w-full sm:w-auto px-8 py-3.5 text-base font-bold rounded-xl group">
                  <span className="flex items-center gap-2">
                    Start Trading Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Link href="/market">
                <Button variant="secondary" className="w-full sm:w-auto px-8 py-3.5 text-base font-bold rounded-xl border-white/10 hover:border-white/25">
                  View Live Markets
                </Button>
              </Link>
            </motion.div>

            <motion.div {...fadeUp} className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex -space-x-2.5">
                {["AC", "SM", "MR", "LK"].map((initials, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-bg-dark bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center text-[9px] font-bold shadow-lg">
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Join <span className="text-foreground font-bold">2,500+</span> active traders
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border-l border-white/10 pl-6">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="ml-1">4.9/5</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-b from-success/5 via-primary/5 to-transparent rounded-3xl blur-2xl opacity-60" />
            <div className="relative bg-bg-card/90 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Mockup Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10">
                    <img src="/images/boyztrade-logo.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-bold">Boyz<span className="text-success">Trade</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success/70 animate-pulse" style={{ animationDuration: "2s" }} />
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Live</span>
                </div>
              </div>

              {/* Mockup Stats */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Portfolio Overview</span>
                  <span className="text-[9px] text-success font-bold">+2.41% today</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Balance</p>
                    <p className="text-xl font-bold tracking-tight">$2,500</p>
                    <p className="text-[9px] text-success font-bold mt-1">VIRTUAL FUNDS</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Total Value</p>
                    <p className="text-xl font-bold tracking-tight">$2,602.50</p>
                    <p className="text-[9px] text-success font-bold mt-1">+$241.32 P&L</p>
                  </div>
                </div>

                {/* Mini Holdings Table */}
                <div className="bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <div className="grid grid-cols-3 gap-0 text-[9px] text-muted-foreground uppercase tracking-widest font-bold px-4 py-2.5 border-b border-white/[0.04]">
                    <span>Asset</span>
                    <span className="text-right">Price</span>
                    <span className="text-right">24h</span>
                  </div>
                  {[
                    { sym: "BTC", name: "Bitcoin", price: "$67,432", change: "+2.41%" },
                    { sym: "ETH", name: "Ethereum", price: "$3,456", change: "+1.82%" },
                    { sym: "SOL", name: "Solana", price: "$143.28", change: "-0.63%" },
                  ].map((a, i) => (
                    <div key={i} className="grid grid-cols-3 gap-0 px-4 py-2.5 border-b border-white/[0.02] last:border-0 items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-white/5 grid place-items-center text-[7px] font-bold">{a.sym}</div>
                        <span className="text-xs font-medium">{a.sym}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-right">{a.price}</span>
                      <span className={`text-xs font-bold text-right ${a.change.startsWith("+") ? "text-success" : "text-danger"}`}>{a.change}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <div className="flex-1 h-8 rounded-lg bg-success/20 border border-success/30 flex items-center justify-center text-[10px] font-bold text-success">
                    Deposit Virtual Funds
                  </div>
                  <div className="flex-1 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    View Portfolio
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -bottom-3 -left-3 bg-bg-card border border-white/10 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-[10px] font-bold">No Real Money Required</p>
                <p className="text-[8px] text-muted-foreground">Fully funded simulation</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function MarketPreview() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div className="flex items-center justify-between mb-10" {...fadeUp}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 mb-4">
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Market Data</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Real Prices, <span className="text-success">Risk Free</span></h2>
          </div>
          <Link href="/market" className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            View all assets
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topAssets.map((asset, i) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-5 transition-all duration-300 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 grid place-items-center text-[10px] font-bold">
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{asset.symbol}</p>
                    <p className="text-[9px] text-muted-foreground tracking-wider">{asset.name}</p>
                  </div>
                </div>
                <Sparkline data={asset.sparkline} color={asset.change >= 0 ? "#10b981" : "#ef4444"} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold font-mono tracking-tight">${asset.price.toLocaleString()}</span>
                <span className={`flex items-center gap-1 text-xs font-bold ${asset.change >= 0 ? "text-success" : "text-danger"}`}>
                  <span className={`inline-block w-0 h-0 ${asset.change >= 0 ? "border-b-[4px] border-b-current border-l-[4px] border-r-[4px] border-l-transparent border-r-transparent" : "border-t-[4px] border-t-current border-l-[4px] border-r-[4px] border-l-transparent border-r-transparent"}`} />
                  {asset.change >= 0 ? "+" : ""}{asset.change}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className="mt-4 text-center" {...fadeUp}>
          <Link href="/market" className="md:hidden inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            View all assets
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: MousePointer2,
      title: "Create Your Account",
      desc: "Sign up in under 30 seconds. No credit card, no ID verification, no strings attached.",
      stat: "30s signup",
    },
    {
      icon: Wallet,
      title: "Get Instantly Funded",
      desc: "Every new account receives $2,500 in virtual USD automatically. Start trading immediately.",
      stat: "$2,500 credit",
    },
    {
      icon: TrendingUp,
      title: "Trade Real Markets",
      desc: "Buy and sell crypto using live market prices via CoinGecko. Execute market and limit orders in real-time.",
      stat: "Real-time execution",
    },
  ];

  return (
    <section className="py-24 px-6 border-t border-white/[0.03] bg-white/[0.01]">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-16" {...fadeUp}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/8 border border-amber-400/15 mb-4">
            <Target className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Getting Started</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Three Steps to <span className="text-success">Start Trading</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mt-4 text-base">
            From zero to full access in minutes. No downloads, no deposits, no delays.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-gradient-to-r from-success/30 via-white/10 to-success/30" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative"
            >
              <div className="hidden md:flex absolute top-14 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-bg-dark border-2 border-success/50 z-10" />
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 h-full hover:border-white/[0.12] transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/15 flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6 text-success" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Step {i + 1}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">{step.stat}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className="mt-12 text-center" {...fadeUp}>
          <Link href="/auth/register">
            <Button className="px-8 py-3 text-base font-bold rounded-xl">
              Create Your Account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function PlatformFeatures() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div className="flex items-end justify-between mb-12" {...fadeUp}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 mb-4">
              <BarChart3 className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Platform Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything a <span className="text-success">Trader Needs</span>
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-white/[0.02] border border-white/[0.06] hover:border-success/20 rounded-2xl p-7 transition-all duration-300 hover:bg-white/[0.03]"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/15 flex items-center justify-center shrink-0 group-hover:bg-success/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const benefits = [
    "Avoid costly beginner mistakes without real financial exposure",
    "Understand market psychology and emotional trading patterns",
    "Test advanced strategies like margin, scalping, and swing trading",
    "Build confidence with the same interface used on real exchanges",
  ];

  const stats = [
    { value: "2,500+", label: "Active Traders", icon: Users },
    { value: "$2.4M+", label: "Virtual Volume", icon: Activity },
    { value: "12", label: "Crypto Assets", icon: Globe },
    { value: "99.9%", label: "Platform Uptime", icon: Timer },
  ];

  return (
    <section className="py-24 px-6 border-t border-white/[0.03] bg-white/[0.01]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div className="space-y-8" {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/8 border border-success/15 mb-2">
              <BookOpen className="w-3 h-3 text-success" />
              <span className="text-[10px] font-bold text-success uppercase tracking-widest">Why Simulate</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Learn Without the <span className="text-success">Lumps</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Crypto trading is one of the few skills where the cost of learning can wipe out your capital. Our simulator removes that risk completely.
            </p>
            <div className="space-y-4">
              {benefits.map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-success/15 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-center hover:border-white/[0.12] transition-colors group"
              >
                <stat.icon className="w-5 h-5 text-success/60 mx-auto mb-3 group-hover:text-success transition-colors" />
                <p className="text-2xl md:text-3xl font-bold tracking-tight text-success">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-14" {...fadeUp}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/8 border border-amber-400/15 mb-4">
            <Quote className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Trader Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            From Our <span className="text-success">Community</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-7 hover:border-white/[0.12] transition-colors duration-300 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-success/30 to-primary/30 flex items-center justify-center text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.handle}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400/70" />
                <span className="text-[10px] text-amber-400/80 font-bold">{t.achievement}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-28 px-6 border-t border-white/[0.03]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-success/[0.03] via-transparent to-primary/[0.03]"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-success/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 px-8 py-16 md:px-20 md:py-20 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95]">
              Ready to Trade Like a <span className="text-success">Pro?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto mt-6 leading-relaxed">
              Join thousands of traders who started their journey risk-free. Your $2,500 virtual account is waiting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link href="/auth/register">
                <Button className="px-10 py-4 text-base font-bold rounded-xl shadow-lg shadow-success/10">
                  Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="secondary" className="px-10 py-4 text-base font-bold rounded-xl border-white/10 hover:border-white/25">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-success" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-success" /> No deposit
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-success" /> No risk
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-dark text-foreground selection:bg-success/30 overflow-x-hidden">
      <HeroSection />
      <MarketPreview />
      <HowItWorks />
      <PlatformFeatures />
      <StatsSection />
      <Testimonials />
      <FinalCTA />
    </main>
  );
}
