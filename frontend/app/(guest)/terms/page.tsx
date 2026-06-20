"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FileText, Scale, AlertTriangle, CheckCircle, 
  Clock, Shield, UserCheck, Mail, ArrowLeft, 
  BookOpen, DollarSign, Activity 
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-bg-dark text-foreground">
      {/* Header */}
      <section className="relative pt-32 pb-16 px-6 border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-[-10%] w-[50%] h-[50%] bg-success/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
            </motion.div>
            <motion.p variants={fadeInUp} className="text-xl text-muted-foreground">
              Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            {/* Agreement */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Agreement to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Boyz Trade ("Platform," "we," "our," or "us"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Platform. These terms apply to all users, visitors, and others who access the service.
              </p>
            </div>

            {/* Virtual Trading Disclaimer - IMPORTANT */}
            <div className="glass p-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-500">
                <AlertTriangle className="w-5 h-5" />
                IMPORTANT: Virtual Trading Only
              </h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-bold text-yellow-500">⚠️ Boyz Trade is a 100% VIRTUAL trading simulator.</span> All funds, balances, and transactions are simulated for educational and entertainment purposes only.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  No real money, cryptocurrency, or financial assets are ever held, transferred, or exchanged on our platform. You cannot deposit, withdraw, or lose real money through Boyz Trade.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Trading results on Boyz Trade do not guarantee future real-world trading outcomes. Cryptocurrency markets are volatile and real trading carries significant financial risk.
                </p>
              </div>
            </div>

            {/* Eligibility */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-success" />
                Eligibility
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                By using Boyz Trade, you represent and warrant that:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                <li>You are at least 15 years of age</li>
                <li>You have the legal capacity to enter into these terms</li>
                <li>You will not use the Platform for any illegal or unauthorized purpose</li>
                <li>Your use of the Platform does not violate any applicable laws</li>
                <li>You will not attempt to manipulate or exploit the virtual trading system</li>
              </ul>
            </div>

            {/* Account Registration */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Account Registration
              </h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  To access certain features, you must register for an account. You agree to:
                </p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  We reserve the right to suspend or terminate accounts that violate these terms or create fake/multiple accounts.
                </p>
              </div>
            </div>

            {/* Virtual Funds */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-success" />
                Virtual Funds Policy
              </h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Upon registration, each new account receives $2500 in virtual USD. These funds:
                </p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-4">
                  <li>Have no real-world monetary value</li>
                  <li>Cannot be withdrawn, transferred, or exchanged for real currency</li>
                  <li>Are for simulation purposes only</li>
                  <li>May be reset, adjusted, or removed at our discretion</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Attempting to sell, trade, or exchange virtual funds for real value violates these terms and will result in immediate account termination.
                </p>
              </div>
            </div>

            {/* Permitted Use */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Permitted Use
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Boyz Trade is designed for educational purposes. You may use the Platform to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Learn crypto trading fundamentals",
                  "Practice buy/sell strategies risk-free",
                  "Track virtual portfolio performance",
                  "Understand market dynamics",
                  "Test trading approaches",
                  "Build trading confidence"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prohibited Activities */}
            <div className="glass p-8 rounded-2xl border border-red-500/20 bg-red-500/5">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                Prohibited Activities
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You agree NOT to engage in any of the following:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                <li>Exploiting bugs or vulnerabilities in the trading system</li>
                <li>Using automated scripts, bots, or API abuse to trade</li>
                <li>Creating multiple accounts to manipulate virtual balances</li>
                <li>Attempting to bypass security or rate limiting measures</li>
                <li>Reverse engineering or decompiling the Platform</li>
                <li>Using the Platform for any illegal purpose</li>
                <li>Harassing, threatening, or abusing other users</li>
                <li>Impersonating Boyz Trade staff or moderators</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The Platform, including its code, design, logos, and content, is owned by Boyz Trade and protected by copyright and trademark laws. You may not copy, modify, distribute, or create derivative works without our express written permission. You retain ownership of your trading data, but grant us license to use it to operate and improve the Platform.
              </p>
            </div>

            {/* Termination */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Termination
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may terminate or suspend your account immediately, without prior notice, for:
              </p>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-4">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent or abusive behavior</li>
                <li>Extended periods of inactivity (12+ months)</li>
                <li>Any other reason at our sole discretion</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Upon termination, your right to use the Platform will cease immediately. You may request account deletion by contacting support.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, Boyz Trade shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or virtual assets, arising from your use of or inability to use the Platform. Because our platform uses virtual funds only, you cannot suffer actual financial loss through Boyz Trade.
              </p>
            </div>

            {/* Disclaimer of Warranties */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. PRICE DATA FROM COINGECKO MAY BE DELAYED OR INACCURATE. TRADING DECISIONS ARE YOUR SOLE RESPONSIBILITY.
              </p>
            </div>

            {/* Governing Law */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws applicable in your jurisdiction, without regard to conflict of law principles. Any disputes arising from these terms or your use of the Platform shall be resolved through binding arbitration or small claims court.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or platform notification. Your continued use of Boyz Trade after changes become effective constitutes acceptance of the revised terms.
              </p>
            </div>

            {/* Contact */}
            <div className="glass p-8 rounded-2xl border border-primary/20 bg-primary/5">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Questions about these Terms of Service? Contact us:
              </p>
              <div className="space-y-1 text-muted-foreground">
                <p>📧 Email: <span className="text-primary">legal@boyztrade.com</span></p>
                <p>🌐 Website: <span className="text-primary">https://boyztrade.com</span></p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}