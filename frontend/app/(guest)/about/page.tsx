"use client";

import Link from "next/link";
import { 
  Users, 
  Target, 
  Lightbulb, 
  Rocket, 
  ShieldCheck, 
  ArrowRight,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-secondary/10 blur-[150px] rounded-full" />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-32 relative z-10">
        <div className="max-w-3xl mb-24">
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8">
            Our Mission is to <span className="text-success drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Democratize</span> Crypto Trading.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Boyz Trade was born out of a simple observation: the crypto market is exciting, but the learning curve is expensive. We built a bridge for the next generation of traders to learn without the fear of losing real money.
          </p>
        </div>

        {/* Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-6">
            <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center border border-success/20">
              <Target className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-3xl font-bold">The Problem</h2>
            <p className="text-muted-foreground leading-relaxed">
              Most beginners are afraid to trade real crypto because of market volatility and the risk of losing their hard-earned savings. Traditional paper trading apps are often cluttered and boring.
            </p>
          </div>

          <div className="glass p-10 rounded-[3rem] border border-success/10 space-y-6">
            <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center border border-success/20">
              <Lightbulb className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-3xl font-bold">Our Solution</h2>
            <p className="text-muted-foreground leading-relaxed">
              We've created a high-fidelity virtual environment. By using real-time market data from CoinGecko and $10,000 in virtual funds, we provide a "Flight Simulator" experience for finance.
            </p>
          </div>
        </div>

        {/* Team / Culture */}
        <div className="space-y-12 mb-32">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Why Choose <span className="text-primary">Boyz Trade?</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We focus on three core pillars that set our platform apart from the rest.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Educational First", 
                desc: "Every feature is designed to teach. Understand P&L, average buy prices, and market cycles.", 
                icon: Rocket,
                color: "primary"
              },
              { 
                title: "Tech-Forward", 
                desc: "Built with Next.js, Flutter, and Firebase for a seamless experience across web and mobile.", 
                icon: Cpu,
                color: "brand-secondary"
              },
              { 
                title: "Safe Environment", 
                desc: "Your data is secure with Firebase Auth and all trades are virtual. Zero financial risk, always.", 
                icon: ShieldCheck,
                color: "success"
              }
            ].map((item) => (
              <div key={item.title} className="p-8 rounded-3xl bg-white/2 border border-white/5 hover:border-primary/20 transition-all group">
                <div className="w-10 h-10 mb-6 group-hover:scale-110 transition-transform">
                   <item.icon className="w-full h-full text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass p-16 rounded-[4rem] border border-white/5 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5">
             <Users className="w-64 h-64" />
          </div>
          <div className="max-w-2xl relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Join our growing community of traders. It takes less than 60 seconds to set up your virtual account and start trading.
            </p>
            <Link href="/auth/register">
              <Button className="px-10 py-4 text-lg">
                Join Boyz Trade
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

    </div>
  );
}
