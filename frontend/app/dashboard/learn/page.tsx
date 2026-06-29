"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronRight, Search } from "lucide-react";
import { learningService, Course } from "@/services/learning";

export default function LearnPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    learningService.browseCourses()
      .then(res => setCourses(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Learning Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Master trading with structured courses</p>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/5 p-6 animate-pulse">
                <div className="h-40 bg-white/10 rounded-lg mb-4" />
                <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground font-bold">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* course cards */}
            {filtered.map(course => (
              <Link
                key={course._id}
                href={`/dashboard/learn/courses/${course._id}`}
                className="group bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:bg-white/[0.07] hover:border-success/20 transition-all duration-300"
              >
                <div className="h-40 bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center overflow-hidden">
                  {course.coverImage?.url ? (
                    <img src={course.coverImage.url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-12 h-12 text-success/40" />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success uppercase tracking-wider">
                      {course.courseType}
                    </span>
                    {course.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold text-sm group-hover:text-success transition-colors line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{course.description}</p>
                  <div className="w-full py-4">
                    {/* <span className="text-[10px] text-muted-foreground">{course.instructor?.fullName || 'Unknown'}</span> */}
                    <ChevronRight className="w-4 h-4 float-right text-muted-foreground group-hover:text-success transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
