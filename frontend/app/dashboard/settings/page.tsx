"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";
import {
  User,
  Lock,
  Bell,
  Moon,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Tab = "general" | "security" | "notifications" | "appearance";

const tabs: { name: string; key: Tab; icon: React.ElementType }[] = [
  { name: "General", key: "general", icon: User },
  { name: "Security", key: "security", icon: Lock },
  { name: "Notifications", key: "notifications", icon: Bell },
  // { name: "Appearance", key: "appearance", icon: Moon },
];

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("general");

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Account <span className="text-success">Settings</span></h1>
        <p className="text-[11px] text-muted-foreground">Manage your profile, security, and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          {activeTab === "general" && <GeneralTab user={user} setUser={setUser} />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "notifications" && <NotificationsTab user={user} setUser={setUser} />}
          {/* {activeTab === "appearance" && <AppearanceTab />} */}
        </div>
      </div>
    </div>
  );
}

function GeneralTab({ user, setUser }: { user: any; setUser: (u: any) => void }) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSave = async () => {
    if (!fullName.trim() || fullName === user?.fullName) return;
    setSaving(true);
    setStatus(null);
    try {
      const updated = await authService.updateProfile(fullName.trim());
      setUser(updated);
      setStatus({ type: "success", message: "Profile updated successfully" });
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = fullName.trim() && fullName !== user?.fullName;

  return (
    <div className="glass p-4 rounded-xl border border-white/5 space-y-4">
      <h3 className="text-sm font-bold border-b border-white/5 pb-2">Personal Information</h3>
      <div className="space-y-3">
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
        />
        <Input
          label="Email Address"
          type="email"
          value={user?.email || ""}
          disabled
          className="opacity-60 cursor-not-allowed"
        />
      </div>

      {status && (
        <div className={`flex items-center gap-2 rounded-lg p-2.5 border ${
          status.type === "success"
            ? "bg-success/10 border-success/20 text-success"
            : "bg-danger/10 border-danger/20 text-danger"
        }`}>
          {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <p className="text-[11px] font-medium">{status.message}</p>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button
          onClick={handleSave}
          variant="primary"
          className="px-6 text-xs h-8"
          disabled={!hasChanges}
          isLoading={saving}
        >
          <Save className="w-3.5 h-3.5 mr-1" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 8) {
      setStatus({ type: "error", message: "Password must be at least 8 characters" });
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setStatus({ type: "success", message: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Failed to change password" });
    } finally {
      setSaving(false);
    }
  };

  const isValid = currentPassword && newPassword && confirmPassword;

  return (
    <div className="glass p-4 rounded-xl border border-white/5 space-y-4">
      <h3 className="text-sm font-bold border-b border-white/5 pb-2">Change Password</h3>

      <form onSubmit={handleChangePassword} className="space-y-3">
        <div className="relative">
          <Input
            label="Current Password"
            type={showPw ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
        </div>
        <div className="relative">
          <Input
            label="New Password"
            type={showPw ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground"
          >
            {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <Input
          label="Confirm New Password"
          type={showPw ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
        />

        {status && (
          <div className={`flex items-center gap-2 rounded-lg p-2.5 border ${
            status.type === "success"
              ? "bg-success/10 border-success/20 text-success"
              : "bg-danger/10 border-danger/20 text-danger"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <p className="text-[11px] font-medium">{status.message}</p>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            variant="primary"
            className="px-6 text-xs h-8"
            disabled={!isValid}
            isLoading={saving}
          >
            <Lock className="w-3.5 h-3.5 mr-1" />
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}

function NotificationsTab({ user, setUser }: { user: any; setUser: (u: any) => void }) {
  const prefs = user?.notificationPreferences || { trade: true, system: true, alert: true, market: false };

  const [settings, setSettings] = useState<Record<string, boolean>>({ ...prefs });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const toggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const updated = await authService.updateSettings({ notificationPreferences: settings });
      setUser(updated);
      setStatus({ type: "success", message: "Notification preferences saved" });
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Failed to save preferences" });
    } finally {
      setSaving(false);
    }
  };

  const labels: Record<string, { label: string; desc: string }> = {
    trade: { label: "Trade Notifications", desc: "Buy/sell order confirmations and trade execution updates" },
    system: { label: "System Notifications", desc: "Account updates, security alerts, and maintenance notices" },
    alert: { label: "Price Alerts", desc: "Price threshold alerts and market movement notifications" },
    market: { label: "Market Updates", desc: "Daily market summaries and trending assets" },
  };

  return (
    <div className="glass p-4 rounded-xl border border-white/5 space-y-4">
      <h3 className="text-sm font-bold border-b border-white/5 pb-2">Notification Preferences</h3>

      <div className="space-y-2">
        {Object.entries(labels).map(([key, { label, desc }]) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-left"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold">{label}</p>
              <p className="text-[9px] text-muted-foreground">{desc}</p>
            </div>
            <div
              className={`ml-3 w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                settings[key as keyof typeof settings] ? "bg-primary" : "bg-white/10"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  settings[key as keyof typeof settings] ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>
        ))}
      </div>

      {status && (
        <div className={`flex items-center gap-2 rounded-lg p-2.5 border ${
          status.type === "success"
            ? "bg-success/10 border-success/20 text-success"
            : "bg-danger/10 border-danger/20 text-danger"
        }`}>
          {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <p className="text-[11px] font-medium">{status.message}</p>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button onClick={handleSave} variant="primary" className="px-6 text-xs h-8" isLoading={saving}>
          <Save className="w-3.5 h-3.5 mr-1" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

function AppearanceTab() {
  return (
    <div className="glass p-4 rounded-xl border border-white/5 space-y-4">
      <h3 className="text-sm font-bold border-b border-white/5 pb-2">Appearance</h3>
      <p className="text-[11px] text-muted-foreground">Theme customization coming soon.</p>
    </div>
  );
}
