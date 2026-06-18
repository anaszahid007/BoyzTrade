"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiFetch from "@/utils/api";
import { Zap, Plus, X, Edit2, Trash2, RefreshCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface Quest {
  _id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  xpReward: number;
  requirement: { type: string; value: number };
  isActive: boolean;
  isRepeatable: boolean;
}

const defaultForm = {
  name: "",
  description: "",
  icon: "📊",
  type: "milestone",
  xpReward: 50,
  requirement: { type: "totalTrades", value: 1 },
  isActive: true,
  isRepeatable: false,
};

const requirementTypes = [
  "totalTrades", "profitableTrades", "currentStreak", "xp", "dailyTrades", "totalPnl", "consecutiveLoginDays"
];
const questTypes = ["daily", "weekly", "milestone"];

export default function AdminQuests() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Quest | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Quest[]>("/api/admin/quests", { method: "GET" });
      setQuests(res.data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user?.role === "admin") fetchQuests(); }, [user, fetchQuests]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (quest: Quest) => {
    setEditing(quest);
    setForm({
      name: quest.name,
      description: quest.description,
      icon: quest.icon,
      type: quest.type,
      xpReward: quest.xpReward,
      requirement: { ...quest.requirement },
      isActive: quest.isActive,
      isRepeatable: quest.isRepeatable,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/api/admin/quests/${editing._id}`, { method: "PATCH", data: form });
      } else {
        await apiFetch("/api/admin/quests", { method: "POST", data: form });
      }
      setShowForm(false);
      fetchQuests();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (questId: string) => {
    if (!confirm("Delete this quest?")) return;
    try {
      await apiFetch(`/api/admin/quests/${questId}`, { method: "DELETE" });
      fetchQuests();
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
            <Zap className="w-6 h-6 text-primary" /> Quest Manager
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={fetchQuests} className="text-[10px] h-8 font-bold">
            <RefreshCcw className="w-3 h-3 mr-1" /> Refresh
          </Button>
          <Button onClick={openCreate} className="text-[10px] h-8 font-bold">
            <Plus className="w-3 h-3 mr-1" /> New Quest
          </Button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass w-full max-w-md border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editing ? "Edit Quest" : "Create Quest"}</h3>
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
                  <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs">
                    {questTypes.map(t => <option key={t} value={t} className="bg-[#0b0c10]">{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">XP Reward</label>
                  <input type="number" min={0} value={form.xpReward} onChange={e => setForm({...form, xpReward: Number(e.target.value)})} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Requirement Type</label>
                  <select value={form.requirement.type} onChange={e => setForm({...form, requirement: {...form.requirement, type: e.target.value}})} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs">
                    {requirementTypes.map(t => <option key={t} value={t} className="bg-[#0b0c10]">{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Requirement Value</label>
                  <input type="number" min={1} value={form.requirement.value} onChange={e => setForm({...form, requirement: {...form.requirement, value: Number(e.target.value)}})} className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={form.isRepeatable} onChange={e => setForm({...form, isRepeatable: e.target.checked})} />
                    Repeatable
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
                  Active
                </label>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1 text-[10px] py-1.5 rounded-lg">Cancel</Button>
                <Button type="submit" isLoading={saving} className="flex-1 text-[10px] py-1.5 rounded-lg">{editing ? "Update" : "Create"} Quest</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quest Table */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-muted-foreground text-[8px] uppercase tracking-[0.2em] font-bold">
                <th className="px-4 py-3">Quest</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">XP</th>
                <th className="px-4 py-3">Requirement</th>
                <th className="px-4 py-3 text-center">Repeatable</th>
                <th className="px-4 py-3 text-center">Active</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">Loading...</td></tr>
              ) : quests.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">No quests found.</td></tr>
              ) : (
                quests.map((quest) => (
                  <tr key={quest._id} className="hover:bg-white/[0.01] transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{quest.icon}</span>
                        <div>
                          <p className="font-bold text-xs">{quest.name}</p>
                          <p className="text-[8px] text-muted-foreground">{quest.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                        quest.type === 'daily' ? 'text-blue-400 bg-blue-400/10' :
                        quest.type === 'weekly' ? 'text-purple-400 bg-purple-400/10' :
                        'text-muted-foreground bg-white/5'
                      }`}>{quest.type}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{quest.xpReward}</td>
                    <td className="px-4 py-3 text-[9px] font-mono">{quest.requirement.type}: {quest.requirement.value}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${quest.isRepeatable ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${quest.isActive ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(quest)} className="p-1.5 bg-white/5 hover:bg-primary/20 rounded text-muted-foreground hover:text-primary transition-all">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(quest._id)} className="p-1.5 bg-white/5 hover:bg-danger/20 rounded text-muted-foreground hover:text-danger transition-all">
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
