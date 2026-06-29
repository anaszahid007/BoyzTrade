"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Plus, Pencil, Trash2, Globe, Users, Clock, Eye } from "lucide-react";
import { learningService, Course } from "@/services/learning";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = () => {
    setLoading(true);
    learningService.myCourses()
      .then(res => setCourses(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = async (courseId: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    try {
      await learningService.deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c._id !== courseId));
    } catch {}
  };

  const handleTogglePublish = async (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    const action = course?.isPublished ? 'unpublish' : 'publish';
    if (!confirm(`Are you sure you want to ${action} this course?`)) return;
    try {
      const res = await learningService.updateCourse(courseId, { isPublished: !course?.isPublished });
      if (res.data) {
        setCourses(prev => prev.map(c => c._id === courseId ? { ...c, isPublished: (res.data as Course).isPublished } : c));
      }
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and create learning content</p>
        </div>
        <Link
          href="/instructor/courses/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-success text-white font-bold text-sm rounded-xl hover:bg-success/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Course
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden animate-pulse">
              <div className="h-36 bg-white/10" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-white/10 rounded w-1/4" />
                <div className="h-5 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/5 rounded-xl">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground font-bold mb-2">No courses yet</p>
          <Link href="/instructor/courses/new" className="text-success font-bold text-sm">Create your first course</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course._id} className="group bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-success/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col">
              <Link href={`/instructor/courses/${course._id}`} className="block">
                <div className="h-36 bg-gradient-to-br from-success/15 to-primary/10 flex items-center justify-center relative overflow-hidden">
                  {course.coverImage?.url ? (
                    <img src={course.coverImage.url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <BookOpen className="w-14 h-14 text-success/30 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm ${
                      course.isPublished ? 'bg-success/15 text-success' : 'bg-amber-500/15 text-amber-500'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm ${
                      course.courseType === 'free' ? 'bg-success/15 text-success' : 'bg-white/10 text-muted-foreground'
                    }`}>
                      {course.courseType}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="p-5 flex flex-col flex-1">
                <Link href={`/instructor/courses/${course._id}`} className="block">
                  <h3 className="font-bold text-sm group-hover:text-success transition-colors line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{course.description || 'No description'}</p>
                </Link>

                <div className="flex items-center gap-4 mt-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {course.enrollmentCount || 0} enrolled
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {(course as any).lessonCount || 0} lessons
                  </span>
                </div>

                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {course.tags.map(t => (
                      <span key={t} className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => handleTogglePublish(course._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-success transition-colors text-xs font-bold"
                    title={course.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <Link
                    href={`/instructor/courses/${course._id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors text-xs font-bold"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-danger transition-colors text-xs font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
