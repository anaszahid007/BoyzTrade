"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import { updatePassword, updateProfile } from "firebase/auth";
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Moon,
  Trash2,
  Save,
  CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    try {
      if (user) {
        if (displayName !== user.displayName) {
          await updateProfile(user, { displayName });
        }
        if (newPassword) {
          await updatePassword(user, newPassword);
          setNewPassword("");
        }
        setSuccess("Profile updated successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Account <span className="gradient-text">Settings</span></h1>
        <p className="text-muted-foreground">Manage your profile, security, and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation / Tabs */}
        <div className="space-y-2">
           {[
             { name: "General", icon: User, active: true },
             { name: "Security", icon: Shield, active: false },
             { name: "Notifications", icon: Bell, active: false },
             { name: "Appearance", icon: Moon, active: false },
           ].map((item) => (
             <button
               key={item.name}
               className={`
                 w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                 ${item.active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}
               `}
             >
               <item.icon className="w-5 h-5" />
               {item.name}
             </button>
           ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdateProfile} className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold border-b border-white/5 pb-4">Personal Information</h3>
              
              <div className="space-y-4">
                <Input
                  label="Display Name"
                  placeholder="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-muted-foreground ml-1">Email Address</label>
                   <Input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground ml-1 italic">Email cannot be changed in the MVP.</p>
                </div>
              </div>

              <h3 className="text-xl font-bold border-b border-white/5 pb-4 pt-4">Change Password</h3>
              <div className="space-y-4">
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                   <Input
                    type="password"
                    placeholder="New Password (leave blank to keep current)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-12"
                  />
                </div>
              </div>
            </div>

            {success && (
              <div className="flex items-center gap-2 text-success bg-success/10 p-4 rounded-xl border border-success/20 text-sm">
                <CheckCircle2 className="w-5 h-5" />
                {success}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={loading} className="px-10">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </form>

          <div className="glass p-8 rounded-[2.5rem] border border-danger/10 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-danger">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <Button variant="danger" className="w-fit">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
