"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Globe, Mail, ArrowLeft } from "lucide-react";
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

export default function PrivacyPolicyPage() {
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
              <div className="p-3 bg-success/10 rounded-2xl">
                <Shield className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
            </motion.div>
            <motion.p variants={fadeInUp} className="text-xl text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
            className="space-y-12"
          >
            {/* Introduction */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-success" />
                Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Welcome to Boyz Trade ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our virtual crypto trading platform.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By using Boyz Trade, you consent to the data practices described in this policy. As a virtual trading simulator, we take your privacy seriously and only collect information necessary to provide and improve our services.
              </p>
            </div>

            {/* Information Collection */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-success" />
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">1. Account Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When you register for Boyz Trade, we collect your email address and a securely hashed password. We do not require real names, phone numbers, or financial information as we operate with virtual funds only.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">2. Trading Activity</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We collect and store your virtual trading history, including buy/sell orders, portfolio holdings, and virtual balance changes. This data is essential for simulating your trading experience and is stored securely in Firebase.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">3. Usage Data</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We automatically collect certain information about your device and how you interact with our platform, including IP address, browser type, pages visited, and time spent on features. This helps us improve user experience.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Use Data */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-success" />
                How We Use Your Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Provide and maintain virtual trading accounts",
                  "Process buy/sell transactions in real-time",
                  "Calculate portfolio performance and P&L",
                  "Improve platform features and user experience",
                  "Send important account notifications",
                  "Prevent fraud and ensure platform security"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-1.5 h-1.5 bg-success rounded-full mt-2" />
                    <p className="text-muted-foreground text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Security */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-success" />
                Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>All data encrypted in transit using TLS/SSL</li>
                <li>Firestore Security Rules restrict access to your data</li>
                <li>Passwords hashed using Firebase Authentication</li>
                <li>Regular security audits and dependency updates</li>
                <li>Cloud Functions run in a secure, isolated environment</li>
              </ul>
            </div>

            {/* Data Sharing */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Data Sharing & Third Parties</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We share data only with essential service providers:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="font-semibold">Firebase (Google)</p>
                  <p className="text-sm text-muted-foreground">Authentication, database, and cloud functions hosting</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="font-semibold">CoinGecko API</p>
                  <p className="text-sm text-muted-foreground">Real-time cryptocurrency price data (no personal data shared)</p>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Your Rights & Choices</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground">You have the right to:</p>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                  <li>Access your personal data stored on our platform</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your account and associated data</li>
                  <li>Opt-out of non-essential communications</li>
                  <li>Export your trading history in a readable format</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise these rights, contact us at <span className="text-success">privacy@boyztrade.com</span>
                </p>
              </div>
            </div>

            {/* Children's Privacy */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Boyz Trade is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.
              </p>
            </div>

            {/* Updates */}
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy regularly.
              </p>
            </div>

            {/* Contact */}
            <div className="glass p-8 rounded-2xl border border-success/20 bg-success/5">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-success" />
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-1 text-muted-foreground">
                <p>📧 Email: <span className="text-success">privacy@boyztrade.com</span></p>
                <p>🌐 Website: <span className="text-success">https://boyztrade.com</span></p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}