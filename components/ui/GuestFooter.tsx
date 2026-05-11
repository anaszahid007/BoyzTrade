"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, Mail, X } from "lucide-react";

export const GuestFooter = () => {
  return (
    <footer className="bg-bg-dark border-t border-white/5 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Logo & Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-xl border border-success/20">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <span className="text-xl font-bold tracking-tight">Boyz<span className="text-success">Trade</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering the next generation of crypto traders through risk-free simulation and real-time market data.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest text-success">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/market" className="text-sm text-muted-foreground hover:text-success transition-colors">Market Prices</Link></li>
              <li><Link href="/trade" className="text-sm text-muted-foreground hover:text-success transition-colors">Virtual Trading</Link></li>
              <li><Link href="/portfolio" className="text-sm text-muted-foreground hover:text-success transition-colors">Portfolio Tracker</Link></li>
              <li><Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-success transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest text-success">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-success transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-success transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-success transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-success transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest text-success">Stay Connected</h4>
            <p className="text-sm text-muted-foreground">Subscribe to get the latest market insights and platform updates.</p>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-success transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-muted-foreground">
          <p className="text-muted">&copy; 2026 Boyz Trade | All Rights Reserved</p>
          <div className="flex items-center gap-6">
            <span>Made with <span className="text-success font-bold">Boyz Trade</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
