"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Minus, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const faqs = [
  {
    question: "Is Boyz Trade a real crypto exchange?",
    answer: "No. Boyz Trade is a 100% virtual trading simulator designed for educational purposes. We use real market data, but you are trading with virtual funds ($10,000 USD) and cannot lose or withdraw real money.",
    icon: ShieldCheck
  },
  {
    question: "Do I need to deposit any money to start?",
    answer: "Absolutely not. Boyz Trade is completely free to use. Every new account is automatically funded with $10,000 in virtual simulation credits.",
    icon: DollarSign
  },
  {
    question: "Where do the crypto prices come from?",
    answer: "Our prices are powered by the CoinGecko API. We fetch real-time market data for the top cryptocurrencies every 30 seconds to ensure your simulation is as close to reality as possible.",
    icon: RefreshCw
  },
  {
    question: "Can I reset my virtual balance?",
    answer: "Currently, the MVP version provides a one-time $10,000 balance. We are working on a feature that will allow users to reset their simulation once they've reached a certain level of experience.",
    icon: Zap
  },
  {
    question: "Is there a mobile app available?",
    answer: "We are currently in the development phase for our Flutter-based mobile application. For now, our web platform is fully responsive and works perfectly on mobile browsers.",
    icon: Activity
  },
  {
    question: "How do I secure my virtual account?",
    answer: "We use Firebase Authentication to secure your account. Your password is encrypted, and your trading data is private to you. We do not sell or share your data with third parties.",
    icon: HelpCircle
  }
];

import { RefreshCw, Activity } from "lucide-react";

function FAQItem({ faq, index }: { faq: any, index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass rounded-3xl border border-white/5 overflow-hidden transition-all duration-300 ${isOpen ? 'border-success/30 bg-success/[0.02]' : 'hover:border-white/10'}`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl transition-colors ${isOpen ? 'bg-success/20 text-success' : 'bg-white/5 text-muted-foreground'}`}>
            <faq.icon className="w-5 h-5" />
          </div>
          <span className={`font-bold transition-colors ${isOpen ? 'text-foreground' : 'text-muted-foreground'}`}>
            {faq.question}
          </span>
        </div>
        <div className={`p-1 rounded-full transition-all duration-300 ${isOpen ? 'rotate-180 bg-success/20 text-success' : 'bg-white/5 text-muted-foreground'}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 pt-2 ml-14">
              <p className="text-muted-foreground leading-relaxed italic">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-foreground">
      {/* Header */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-success/10 blur-[120px] rounded-full opacity-20" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest"
          >
            <HelpCircle className="w-3 h-3" />
            Support Center
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight">Frequently Asked <br /><span className="text-success drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Questions</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about starting your virtual crypto journey with Boyz Trade.
          </p>
        </div>
      </section>

      {/* FAQ Grid */}
      <section className="py-12 pb-32 px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-20 relative overflow-hidden">
          <div className="space-y-8 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold">Still have <span className="text-success">Questions?</span></h2>
            <p className="text-lg text-muted-foreground">
              Can't find the answer you're looking for? Our team is always here to help you understand the platform better.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="px-8 py-3">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="secondary" className="px-8 py-3 border-white/10">
                <MessageCircle className="w-4 h-4 mr-2" />
                Join Community
              </Button>
            </div>
          </div>

          <div className="relative group">
             <div className="absolute inset-0 bg-success/10 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
             <div className="glass p-12 rounded-[3rem] border border-white/10 relative z-10 space-y-6">
                <div className="w-16 h-16 bg-success/20 rounded-2xl flex items-center justify-center border border-success/30">
                  <Zap className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold italic">"Best way to learn crypto without the heart attacks of losing real money."</h3>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-secondary border border-white/10" />
                   <div>
                      <p className="font-bold">Alex Rivera</p>
                      <p className="text-xs text-muted-foreground">Crypto Beginner</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
