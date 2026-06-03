"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Lock,
  Bell,
  Shield,
  Moon,
  Trash2,
  Save,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Account <span className="gradient-text">Settings</span></h1>
        <p className="text-muted-foreground">Manage your profile, security, and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-2">
          {[
            { name: "General", icon: User, active: true },
            { name: "Security", icon: Shield, active: false },
            { name: "Notifications", icon: Bell, active: false },
            { name: "Appearance", icon: Moon, active: false },
          ].map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                item.active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold border-b border-white/5 pb-4">Personal Information</h3>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={user?.fullName || ""}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <p className="text-sm text-muted-foreground">Profile editing is supported through backend user settings in a future update.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold border-b border-white/5 pb-4">Security</h3>
              <p className="text-sm text-muted-foreground">Password changes are not enabled in this version. Use the forgot password flow if you need to reset your password.</p>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="secondary" className="px-10" disabled>
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-danger/10 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-danger">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">Account deletion is not available from the frontend yet. Contact support for help closing your account.</p>
            </div>
            <Button variant="danger" className="w-fit" disabled>
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
