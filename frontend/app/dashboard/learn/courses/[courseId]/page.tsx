"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle, Clock, Play } from "lucide-react";
import { learningService, Course, Progress } from "@/services/learning";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    learningService.getCourseDetail(courseId)
      .then(res => {
        setCourse(res.data || null);
        return learningService.getProgress(courseId).catch(() => null);
      })
      .then(p => {
        if (p?.data) {
          setProgress(p.data);
          setEnrolled(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await learningService.enroll(courseId);
      if (res.success) {
        setEnrolled(true);
        const p = await learningService.getProgress(courseId);
        if (p.data) setProgress(p.data);
      }
    } catch {}
    setEnrolling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark text-foreground p-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-8" />
          <div className="h-64 bg-white/5 rounded-xl mb-6" />
          <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
          <div className="h-4 bg-white/10 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-bg-dark text-foreground flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground font-bold">Course not found</p>
          <Link href="/dashboard/learn" className="text-success text-sm font-bold mt-2 inline-block">Back to courses</Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.lessons?.length || 0;

  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        <Link href="/dashboard/learn" className="inline-flex items-center gap-1.5 text-success hover:text-foreground text-xs font-bold mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Courses
        </Link>

        <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden mb-8">
          <div className="h-48 lg:h-64 bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center">
            {course.coverImage?.url ? (
              <img src={course.coverImage.url} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-16 h-16 text-success/30" />
            )}
          </div>
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success uppercase tracking-wider">{course.courseType}</span>
              <span className="text-xs text-muted-foreground">{totalLessons} lessons</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight mb-3">{course.title}</h1>
            <p className="text-sm text-muted-foreground mb-6">{course.description}</p>

            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  {course.instructor?.fullName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-xs font-bold">{course.instructor?.fullName || 'Unknown'}</p>
                  <p className="text-[10px] text-muted-foreground">Instructor</p>
                </div>
              </div> */}

              {!enrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="px-6 py-2.5 bg-success text-white font-bold text-sm rounded-xl hover:bg-success/90 transition-colors disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full transition-all" style={{ width: `${progress?.enrollment?.progress || 0}%` }} />
                    </div>
                    <span className="text-xs font-bold text-success">{progress?.enrollment?.progress || 0}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {course.lessons && course.lessons.length > 0 && (
          <div>
            <h2 className="font-bold text-lg mb-4">Course Content</h2>
            <div className="space-y-1">
              {course.lessons.map((lesson, idx) => {
                const isCompleted = progress?.lessons?.find(l => l._id === lesson._id)?.completed;
                return (
                  <Link
                    key={lesson._id}
                    href={enrolled ? `/dashboard/learn/courses/${courseId}/lessons/${lesson._id}` : '#'}
                    className={`flex items-center justify-between p-4 rounded-xl transition-colors ${enrolled ? 'hover:bg-white/[0.03] cursor-pointer' : 'cursor-default'} border border-transparent hover:border-white/5`}
                    onClick={e => { if (!enrolled) e.preventDefault(); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isCompleted ? 'text-success' : 'text-foreground'}`}>{lesson.title}</p>
                        {lesson.duration > 0 && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {lesson.duration} min
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : enrolled ? (
                        <Play className="w-4 h-4 text-muted-foreground" />
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
