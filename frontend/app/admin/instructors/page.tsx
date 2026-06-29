"use client";

import { useState, useEffect } from "react";
import { Shield, BookOpen, Users, Calendar } from "lucide-react";
import apiFetch from "@/utils/api";

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/users?role=instructor')
      .then(res => setInstructors(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Instructor Management</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage instructor accounts</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-500 font-bold text-xs rounded-xl">
          <Shield className="w-3.5 h-3.5" />
          {loading ? '...' : instructors.length} Instructors
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : instructors.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/5 rounded-xl">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground font-bold">No instructors found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {instructors.map(instructor => (
            <div key={instructor._id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center text-lg font-black text-success/60">
                {instructor.fullName?.charAt(0)?.toUpperCase() || 'I'}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{instructor.fullName || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{instructor.email}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(instructor.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {instructor.courseCount || 0} courses
                  </span>
                </div>
              </div>
              <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-bold rounded-lg">Instructor</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
