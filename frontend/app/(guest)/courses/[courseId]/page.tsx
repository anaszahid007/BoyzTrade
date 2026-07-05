"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Users, Sparkles, CheckCircle, Loader2, LogIn, GraduationCap, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { learningService, Course } from "@/services/learning";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<(Course & { lessonCount?: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId) return;
    learningService.getPublicCourseDetail(courseId)
      .then(res => {
        if (res.data) setCourse(res.data);
      })
      .catch(() => router.push('/courses'))
      .finally(() => setLoading(false));
  }, [courseId, router]);

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/courses/${courseId}`)}`);
      return;
    }
    setEnrolling(true);
    setError('');
    try {
      const res = await learningService.enroll(courseId);
      if (res.success) {
        setEnrolled(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to enroll');
    }
    setEnrolling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark text-foreground">
        <div className="max-w-4xl mx-auto p-6 lg:p-8 animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/4 mb-8" />
          <div className="h-64 bg-white/5 rounded-xl mb-8" />
          <div className="h-8 bg-white/10 rounded w-2/3 mb-3" />
          <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
          <div className="h-4 bg-white/10 rounded w-1/3" />
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
          <Link href="/courses" className="text-sm text-success hover:underline mt-2 inline-block">Browse courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-foreground selection:bg-success/30">
      {/* Back link */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-6">
        <Link href="/courses" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-bold transition-colors group">
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          All Courses
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-64 lg:h-72 bg-gradient-to-br from-success/20 to-primary/10 rounded-2xl overflow-hidden border border-white/5"
            >
              {course.coverImage?.url ? (
                <img src={course.coverImage.url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-success/30" />
                </div>
              )}
            </motion.div>

            {/* Title & Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-success/15 text-success uppercase tracking-wider">
                  {course.courseType}
                </span>
                {course.tags?.map(tag => (
                  <span key={tag} className="text-[10px] font-medium px-2 py-1 rounded-full bg-white/5 text-muted-foreground flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight mb-2">{course.title}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
            </motion.div>

            {/* What you'll learn */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5"
            >
              <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-success" />
                What You'll Learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Understand market structure and trends',
                  'Read candlestick patterns like a pro',
                  'Manage risk with position sizing',
                  'Build a trading plan that works',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right - Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-28 space-y-4">
              {/* Enroll Card */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <div className="text-center mb-6">
                  <p className="text-2xl font-black text-success">Free</p>
                  <p className="text-xs text-muted-foreground mt-1">No payment required</p>
                </div>

                {enrolled ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-success mb-3">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-bold text-sm">Enrolled</span>
                    </div>
                    <Link
                      href={`/dashboard/learn/courses/${courseId}`}
                      className="block w-full py-3 bg-success text-white font-bold text-sm rounded-xl hover:bg-success/90 transition-colors text-center"
                    >
                      Start Learning
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || authLoading}
                    className="w-full py-3 bg-success text-white font-bold text-sm rounded-xl hover:bg-success/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {enrolling ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling...</>
                    ) : !user ? (
                      <><LogIn className="w-4 h-4" /> Sign In to Enroll</>
                    ) : (
                      <><BookOpen className="w-4 h-4" /> Enroll Now</>
                    )}
                  </button>
                )}

                {error && (
                  <p className="text-[10px] text-danger text-center mt-2">{error}</p>
                )}

                {/* Course Stats */}
                <div className="space-y-3 mt-6 pt-5 border-t border-white/5">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <BookOpen className="w-4 h-4 text-success" />
                    <span>{course.lessonCount || 0} lessons</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Clock className="w-4 h-4 text-success" />
                    <span>Self-paced</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Users className="w-4 h-4 text-success" />
                    <span>Free access</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {course.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificate */}
              <div className="bg-gradient-to-br from-success/10 to-primary/5 border border-success/10 rounded-xl p-4 text-center">
                <Sparkles className="w-5 h-5 text-success mx-auto mb-2" />
                <p className="text-xs font-bold">Complete all lessons</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Track your progress as you learn</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
