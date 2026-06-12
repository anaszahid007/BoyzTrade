"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/admin";
import {
  Megaphone,
  ArrowLeft,
  Send,
  AlertTriangle,
  CheckCircle,
  BellRing
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function BroadcastAlerts() {
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("SYSTEM");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert("Title and message are required");
      return;
    }

    setLoading(true);
    setSuccessMsg(null);
    try {
      const response = await adminService.broadcastMessage(title, message, type);
      setSuccessMsg(response.message || "System broadcast sent successfully");
      setTitle("");
      setMessage("");
    } catch (err: any) {
      alert(err.message || "Failed to broadcast message");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass p-6 rounded-xl border border-white/5 text-center">
          <p className="text-success font-bold">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-[10px] text-success font-bold hover:underline mb-1">
          <ArrowLeft className="w-3 h-3" />
          Back to Admin Terminal
        </Link>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-success" />
          Broadcast Center
        </h1>
        <p className="text-[11px] text-muted-foreground">Draft and dispatch system-wide notifications and alerts. Announcements are delivered instantly in real-time.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-success">Broadcast Successful</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Warning Box */}
      <div className="glass p-4 rounded-xl border border-white/5 bg-gradient-to-r from-success/10 to-transparent flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-success shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-success">High Impact Action</h4>
          <p className="text-[10px] text-muted-foreground leading-normal font-medium">
            Announcements are bulk-inserted for all registered users, triggering immediate database storage and firing live Web Socket alerts to active traders. Make sure to double-check details before broadcasting.
          </p>
        </div>
      </div>

      {/* Broadcast Form */}
      <div className="glass p-6 rounded-xl border border-white/5">
        <form onSubmit={handleSubmit} className="space-y-5 font-sans">
          {/* Notification Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Announcement Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Planned Database Maintenance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all"
            />
          </div>

          {/* Type Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Notification Priority & Type
            </label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs text-muted-foreground focus:outline-none focus:border-success/50 focus:bg-white/10 focus:text-foreground transition-all appearance-none cursor-pointer"
              >
                <option value="SYSTEM" className="bg-[#0b0c10]">SYSTEM - Standard platform update</option>
                <option value="ALERT" className="bg-[#0b0c10]">ALERT - Urgent warning or maintenance notice</option>
                <option value="MARKET" className="bg-[#0b0c10]">MARKET - Market-related alert or news</option>
              </select>
              <BellRing className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
            </div>
          </div>

          {/* Message Body */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Message Content (Markdown Supported)
            </label>
            <textarea
              required
              rows={5}
              placeholder="Draft announcement details here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            isLoading={loading}
            className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-success to-success/80 text-white flex items-center justify-center gap-1.5 border border-success/30 hover:bg-success/90"
          >
            <Send className="w-3.5 h-3.5" />
            Broadcast Notification
          </Button>
        </form>
      </div>
    </div>
  );
}
