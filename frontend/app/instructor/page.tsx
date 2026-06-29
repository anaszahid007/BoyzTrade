"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Users, Plus, ArrowRight, GraduationCap } from "lucide-react";
import { learningService, Course } from "@/services/learning";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    learningService.myCourses()
      .then(res => setCourses(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Instructor Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your courses and track student progress</p>
        </div>
        <Link
          href="/instructor/courses/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-success text-white font-bold text-sm rounded-xl hover:bg-success/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Course
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-success" />
            </div>
          </div>
          <p className="text-2xl font-black">{loading ? '...' : courses.length}</p>
          <p className="text-xs text-muted-foreground font-bold mt-1">Courses Published</p>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-black">{loading ? '...' : totalStudents}</p>
          <p className="text-xs text-muted-foreground font-bold mt-1">Total Enrolled Users</p>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-black">{loading ? '...' : courses.length}</p>
          <p className="text-xs text-muted-foreground font-bold mt-1">Total Courses</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">My Courses</h2>
          <Link href="/instructor/courses" className="text-xs text-success font-bold flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground font-bold">No courses yet</p>
            <Link href="/instructor/courses/new" className="text-xs text-success font-bold mt-2 inline-block">Create your first course</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map(course => (
              <Link
                key={course._id}
                href={`/instructor/courses/${course._id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-success/60" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{course.title}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded-full ${course.isPublished ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-500'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <span>{course.courseType}</span>
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
