"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  ChevronRight,
  MousePointer2,
  CheckCircle2,
  Activity,
  DollarSign,
  Timer,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-32 lg:pb-32 px-6">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-[-10%] w-[50%] h-[50%] bg-success/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="space-y-8 relative z-10"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >            
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-7xl lg:text-6xl font-bold tracking-tight leading-[0.95]">
              Master the <br />
              <span className="text-muted-foreground">Crypto </span> 
              <span className="relative inline-block">
                <span className="text-success drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Markets</span>
                <motion.span 
                  className="absolute -bottom-2 left-0 h-1 bg-success rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1, duration: 0.8 }}
                />
              </span> <br />
              Without Risk.
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl text-muted-foreground max-w-lg leading-relaxed">
              Step into the high-fidelity world of crypto trading. Get <span className="text-foreground font-bold">$10,000</span> in virtual funds and trade real market movements in real-time.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/register">
                <Button className="w-full sm:w-auto px-8 py-3 text-xl font-bold rounded-2xl group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Start Trading
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="secondary" className="w-full sm:w-auto px-8 py-3 text-xl font-bold rounded-2xl border border-white/10 hover:border-primary/30 transition-all">
                  Learn More
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-dark bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center text-[10px] font-bold shadow-lg">
                    U{i}
                  </div>
                ))}
              </div>
              <p>Join <span className="text-foreground font-bold">2,500+</span> traders learning today</p>
            </motion.div>
          </motion.div>

        {/* Hero Video Implementation */}
        <div className="relative lg:block group">
          <div className="absolute -inset-1 bg-gradient-to-r from-success/20 to-primary/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <video 
            src="/videos/hero_animated_video.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="relative w-full h-auto rounded-[2.5rem] border border-white/10 shadow-2xl"
          />
        </div>
      </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold">Three Simple <span className="text-success drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Steps</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">From zero to pro in minutes. Our platform is designed for rapid learning.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                step: "01", 
                title: "Create Account", 
                desc: "Sign up in seconds. No credit card, no identity verification, no risk.",
                icon: MousePointer2,
                color: "from-blue-500/20 to-blue-500/5"
              },
              { 
                step: "02", 
                title: "Get $10,000", 
                desc: "We auto-fund every new account with $10k virtual USD to start your journey.",
                icon: DollarSign,
                color: "from-green-500/20 to-green-500/5"
              },
              { 
                step: "03", 
                title: "Trade Live", 
                desc: "Execute BUY and SELL orders using real market prices from CoinGecko.",
                icon: Activity,
                color: "from-purple-500/20 to-purple-500/5"
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                className={`glass p-10 rounded-[2.5rem] border border-white/5 relative group hover:border-${item.color.split('/')[1]}/30 transition-all duration-500 bg-gradient-to-br ${item.color}`}
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="text-6xl font-black text-white/5 absolute top-6 right-8 group-hover:text-primary/10 transition-colors">
                  {item.step}
                </div>
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mb-8 group-hover:bg-primary group-hover:text-white transition-all group-hover:scale-110">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="py-24 px-6">
        <motion.div 
          className="max-w-7xl mx-auto glass p-12 md:p-20 rounded-[4rem] border border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Why Practice with a <span className="text-success">Simulator?</span>
            </h2>
            <div className="space-y-6">
              {[
                "Avoid costly 'newbie' mistakes with real money",
                "Understand market psychology without the stress",
                "Test advanced strategies risk-free",
                "Learn the technical interface of real exchanges"
              ].map((text, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="mt-1 p-1 bg-success/10 rounded-full text-success">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-lg text-muted-foreground font-medium">{text}</p>
                </motion.div>
              ))}
            </div>
            <Button variant="secondary" className="px-8 py-3 rounded-xl border border-border/50 hover:border-success/30 transition-all group">
              Read Our Full Guide <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "30s", label: "Update Rate", icon: Timer },
              { value: "5+", label: "Top Assets", icon: TrendingUp },
              { value: "Free", label: "Always Virtual", icon: ShieldCheck },
              { value: "Global", label: "Trading Access", icon: Globe }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                className="p-6 rounded-2xl bg-white/2 border border-white/5 text-center space-y-2 hover:border-success/20 transition-all hover:bg-success/5 group"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <stat.icon className="w-6 h-6 text-success/50 mx-auto mb-2 group-hover:text-success transition-colors" />
                <p className="text-3xl font-black text-success drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-success/5 to-transparent pointer-events-none" />
        <motion.div 
          className="max-w-4xl mx-auto space-y-8 relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-block"
          >
            <Award className="w-16 h-16 text-success mx-auto mb-4" />
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight">Ready to become a <br /> <span className="text-success drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Crypto Whale?</span></h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            "The best time to learn was yesterday. The second best time is today risk-free."
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="/auth/register">
              <Button className="w-full sm:w-auto px-12 py-5 text-xl font-bold rounded-2xl shadow-2xl group relative overflow-hidden">
                <span className="relative z-10">Create Free Account</span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-success to-success/80"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground font-medium">Join 2,500+ traders</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}