"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Clock, Search, Users, Sparkles, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { learningService, Course } from "@/services/learning";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    learningService.browsePublicCourses()
      .then(res => setCourses(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-bg-dark text-foreground selection:bg-success/30">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-success/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full text-success text-[10px] font-bold uppercase tracking-wider mb-6"
          >
            <Sparkles className="w-3 h-3" />
            Learning Center
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black tracking-tight mb-4"
          >
            Master Crypto{" "}
            <span className="text-success">Trading</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto mb-10"
          >
            Structured courses designed to take you from beginner to confident trader. Learn at your own pace with hands-on lessons.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-8 lg:gap-12 flex-wrap"
          >
            {[
              { icon: BookOpen, label: "Courses", value: courses.length },
              { icon: Clock, label: "Self-Paced", value: "Learn" },
              { icon: Users, label: "Free Access", value: "All" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center text-success">
                  <s.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
            />
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden animate-pulse">
                  <div className="h-44 bg-white/10" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-white/10 rounded w-1/4" />
                    <div className="h-5 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground font-bold text-lg">No courses found</p>
              <p className="text-muted-foreground text-sm mt-1">Try a different search term</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course, i) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/courses/${course._id}`}
                    className="group block bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-success/20 hover:bg-white/[0.04] transition-all duration-300 h-full"
                  >
                    <div className="h-44 bg-gradient-to-br from-success/15 to-primary/10 flex items-center justify-center overflow-hidden relative">
                      {course.coverImage?.url ? (
                        <img src={course.coverImage.url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <BookOpen className="w-16 h-16 text-success/30" />
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-success/15 text-success uppercase tracking-wider backdrop-blur-sm">
                          {course.courseType}
                        </span>
                      </div>
                      {course.lessonCount !== undefined && (
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-black/40 text-white/80 backdrop-blur-sm flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {course.lessonCount} {course.lessonCount === 1 ? 'lesson' : 'lessons'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                        {course.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-bold text-sm group-hover:text-success transition-colors line-clamp-2 leading-relaxed">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-end mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1 text-success text-[10px] font-bold shrink-0">
                          {user ? 'Enroll Now' : 'Get Started'}
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Learn Section */}
      {courses.length > 0 && (
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-bold uppercase tracking-wider mb-4">
                <TrendingUp className="w-3 h-3" />
                Why Learn With Us
              </div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
                Built for <span className="text-success">Real Trading</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: BookOpen, title: "Structured Path", desc: "Courses organized from basics to advanced strategies. No random YouTube tutorials." },
                { icon: Shield, title: "Risk-Free Practice", desc: "Apply what you learn with $2500 in virtual funds. Real market data, zero risk." },
                { icon: TrendingUp, title: "Practical Skills", desc: "Hands-on lessons with real chart analysis, order types, and market scenarios." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.12] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center text-success mb-4">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
