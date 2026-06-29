"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Users, Globe, Trash2, Search } from "lucide-react";
import { learningService, Course } from "@/services/learning";

export default function AdminLearningCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAll = () => {
    setLoading(true);
    learningService.adminAllCourses()
      .then(res => setCourses(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (courseId: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    try {
      await learningService.deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c._id !== courseId));
    } catch {}
  };

  const handleTogglePublish = async (courseId: string, current: boolean) => {
    try {
      await learningService.updateCourse(courseId, { isPublished: !current });
      setCourses(prev => prev.map(c => c._id === courseId ? { ...c, isPublished: !current } : c));
    } catch {}
  };

  const filtered = courses.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Learning Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">Oversight of all courses across the platform</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="w-3.5 h-3.5" />
          {loading ? '...' : courses.length} Total Courses
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
          placeholder="Search courses..."
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/5 rounded-xl">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground font-bold">{search ? 'No matching courses' : 'No courses yet'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(course => (
            <div key={course._id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-success/60" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/learn/courses/${course._id}`} className="font-bold text-sm hover:text-success transition-colors">
                  {course.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{course.description || 'No description'}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${course.isPublished ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-500'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase">{course.courseType}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course.enrollmentCount || 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleTogglePublish(course._id, course.isPublished)}
                  className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-success transition-colors"
                  title={course.isPublished ? 'Unpublish' : 'Publish'}
                >
                  <Globe className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-danger transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
