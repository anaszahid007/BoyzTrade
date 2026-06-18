"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiFetch from "@/utils/api";
import { Award, Plus, X, Edit2, Trash2, RefreshCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xpReward: number;
  requirement: { type: string; value: number };
  isActive: boolean;
}

const defaultForm = {
  name: "",
  description: "",
  icon: "🏆",
  category: "milestone",
  rarity: "common",
  xpReward: 50,
  requirement: { type: "totalTrades", value: 1 },
  isActive: true,
};

const requirementTypes = [
  "totalTrades", "profitableTrades", "currentStreak", "level", "xp", "stopLossUsed", "lessonsCompleted", "challengesCompleted"
];
const categories = ["trade", "streak", "level", "profit", "social", "milestone"];
const rarities = ["common", "uncommon", "rare", "epic", "legendary"];

export default function AdminBadges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Badge | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBadges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Badge[]>("/api/admin/badges", { method: "GET" });
      setBadges(res.data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user?.role === "admin") fetchBadges(); }, [user, fetchBadges]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (badge: Badge) => {
    setEditing(badge);
    setForm({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      rarity: badge.rarity,
      xpReward: badge.xpReward,
      requirement: { ...badge.requirement },
      isActive: badge.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/api/admin/badges/${editing._id}`, { method: "PATCH", data: form });
      } else {
        await apiFetch("/api/admin/badges", { method: "POST", data: form });
      }
      setShowForm(false);
      fetchBadges();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (badgeId: string) => {
    if (!confirm("Delete this badge?")) return;
    try {
      await apiFetch(`/api/admin/badges/${badgeId}`, { method: "DELETE" });
      fetchBadges();
    } catch (err: any) { alert(err.message); }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-[10px] text-success font-bold hover:underline mb-1">
            <ArrowLeft className="w-3 h-3" /> Back to Admin Terminal
          </Link>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-warning" /> Badge Manager
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={fetchBadges} className="text-[10px] h-8 font-bold">
            <RefreshCcw className="w-3 h-3 mr-1" /> Refresh
          </Button>
          <Button onClick={openCreate} className="text-[10px] h-8 font-bold">
            <Plus className="w-3 h-3 mr-1" /> New Badge
          </Button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass w-full max-w-md border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editing ? "Edit Badge" : "Create Badge"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Icon (emoji)</label>
                  <input required value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                <input required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs">
                    {categories.map(c => <option key={c} value={c} className="bg-[#0b0c10]">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Rarity</label>
                  <select value={form.rarity} onChange={e => setForm({...form, rarity: e.target.value})} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs">
                    {rarities.map(r => <option key={r} value={r} className="bg-[#0b0c10]">{r}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">XP Reward</label>
                  <input type="number" min={0} value={form.xpReward} onChange={e => setForm({...form, xpReward: Number(e.target.value)})} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Requirement Type</label>
                  <select value={form.requirement.type} onChange={e => setForm({...form, requirement: {...form.requirement, type: e.target.value}})} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs">
                    {requirementTypes.map(t => <option key={t} value={t} className="bg-[#0b0c10]">{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Requirement Value</label>
                  <input type="number" min={1} value={form.requirement.value} onChange={e => setForm({...form, requirement: {...form.requirement, value: Number(e.target.value)}})} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
                  Active
                </label>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1 text-[10px] py-1.5 rounded-lg">Cancel</Button>
                <Button type="submit" isLoading={saving} className="flex-1 text-[10px] py-1.5 rounded-lg">{editing ? "Update" : "Create"} Badge</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Badge Table */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-muted-foreground text-[8px] uppercase tracking-[0.2em] font-bold">
                <th className="px-4 py-3">Badge</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Rarity</th>
                <th className="px-4 py-3 text-right">XP</th>
                <th className="px-4 py-3">Requirement</th>
                <th className="px-4 py-3 text-center">Active</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">Loading...</td></tr>
              ) : badges.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">No badges found.</td></tr>
              ) : (
                badges.map((badge) => (
                  <tr key={badge._id} className="hover:bg-white/[0.01] transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{badge.icon}</span>
                        <div>
                          <p className="font-bold text-xs">{badge.name}</p>
                          <p className="text-[8px] text-muted-foreground">{badge.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-[9px] font-bold capitalize">{badge.category}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        badge.rarity === 'legendary' ? 'text-yellow-400 bg-yellow-400/10' :
                        badge.rarity === 'epic' ? 'text-purple-400 bg-purple-400/10' :
                        badge.rarity === 'rare' ? 'text-blue-400 bg-blue-400/10' :
                        badge.rarity === 'uncommon' ? 'text-green-400 bg-green-400/10' :
                        'text-muted-foreground bg-white/5'
                      }`}>{badge.rarity}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{badge.xpReward}</td>
                    <td className="px-4 py-3 text-[9px] font-mono">{badge.requirement.type}: {badge.requirement.value}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${badge.isActive ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(badge)} className="p-1.5 bg-white/5 hover:bg-primary/20 rounded text-muted-foreground hover:text-primary transition-all">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(badge._id)} className="p-1.5 bg-white/5 hover:bg-danger/20 rounded text-muted-foreground hover:text-danger transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
