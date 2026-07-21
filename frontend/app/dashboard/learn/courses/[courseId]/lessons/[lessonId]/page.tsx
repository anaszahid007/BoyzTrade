"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, FileText, Download, Loader2 } from "lucide-react";
import { learningService, Course, Progress } from "@/services/learning";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [prevLesson, setPrevLesson] = useState<string | null>(null);
  const [nextLesson, setNextLesson] = useState<string | null>(null);
  const [videoStreamUrl, setVideoStreamUrl] = useState('');

  useEffect(() => {
    if (!courseId || !lessonId) return;
    setLoading(true);
    Promise.all([
      learningService.getCourseDetail(courseId),
      learningService.getProgress(courseId).catch(() => null),
    ]).then(([courseRes, progressRes]) => {
      const c = courseRes.data as Course;
      const p = progressRes?.data as Progress | null;
      setCourse(c);
      setProgress(p);
      const allLessons = c?.lessons || [];
      const idx = allLessons.findIndex(l => l._id === lessonId);
      if (idx >= 0) {
        setLesson(allLessons[idx]);
        if (idx > 0) setPrevLesson(allLessons[idx - 1]._id);
        if (idx < allLessons.length - 1) setNextLesson(allLessons[idx + 1]._id);
        if (p) {
          const isComp = p.lessons?.some(l => l._id === lessonId && l.completed);
          setCompleted(!!isComp);
        }
      }
    }).catch(() => { }).finally(() => setLoading(false));

    learningService.getVideoStream(lessonId).then(res => {
      if (res.data?.url) setVideoStreamUrl(res.data.url);
    }).catch(() => { });
  }, [courseId, lessonId]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await learningService.completeLesson(lessonId);
      setCompleted(true);
      const p = await learningService.getProgress(courseId).catch(() => null);
      if (p?.data) setProgress(p.data);
    } catch { }
    setCompleting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark text-foreground p-8 animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-8" />
          <div className="h-8 bg-white/10 rounded w-1/2 mb-4" />
          <div className="h-64 bg-white/5 rounded-xl mb-6" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-bg-dark text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Lesson not found</p>
      </div>
    );
  }

  const courseTitle = course?.title || 'Back to Course';

  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        <Link href={`/dashboard/learn/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-success hover:text-foreground text-xs font-bold mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          {courseTitle}
        </Link>

        <h1 className="text-xl lg:text-2xl font-black tracking-tight mb-2">{lesson.title}</h1>
        {lesson.duration > 0 && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-6">
            <Clock className="w-3.5 h-3.5" />
            {lesson.duration} minutes
          </p>
        )}

        {(lesson.videoUrl && videoStreamUrl) && (
          // <div className="relative aspect-video p-0 rounded-xl border border-5 overflow-hidden mb-8">
          //   <iframe
          //     src={videoStreamUrl}
          //     title={lesson.title}
          //     className="absolute top-0 left-0 w-full h-full object-cover"
          //     allowFullScreen
          //     allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          //   />
          // </div>
          <div className="aspect-video w-full rounded-xl border-1 border-neutral-800 overflow-hidden mb-8">
            <video
              src={videoStreamUrl}
              controls
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {lesson.content && (
          <div className="bg-white/5 border border-white/5 rounded-xl p-6 mb-8 text-sm leading-relaxed">
            <MarkdownRenderer content={lesson.content} />
          </div>
        )}

        {lesson.attachments?.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Attachments
            </h3>
            <div className="space-y-2">
              {lesson.attachments.map((att: any, i: number) => (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.07] transition-colors"
                >
                  <span className="text-xs font-bold">{att.name}</span>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            {completed ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-bold">Completed</span>
              </div>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="px-6 py-2.5 bg-success text-white font-bold text-sm rounded-xl hover:bg-success/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {completing && <Loader2 className="w-4 h-4 animate-spin" />}
                Mark as Complete
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {prevLesson && (
              <button
                onClick={() => router.push(`dashboard/learn/courses/${courseId}/lessons/${prevLesson}`)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-foreground font-bold text-xs rounded-xl hover:bg-white/10 transition-colors"
              >
                Previous
              </button>
            )}
            {nextLesson && (
              <button
                onClick={() => router.push(`dashboard/learn/courses/${courseId}/lessons/${nextLesson}`)}
                className="px-4 py-2 bg-success text-white font-bold text-xs rounded-xl hover:bg-success/90 transition-colors"
              >
                Next Lesson
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
