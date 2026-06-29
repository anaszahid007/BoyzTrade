"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, Video, Upload, Image as ImageIcon, X, Loader2, Settings, List } from "lucide-react";
import { learningService, Course, Lesson } from "@/services/learning";

type Tab = 'lessons' | 'settings';

export default function CourseBuilderPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<(Course & { lessons: Lesson[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('lessons');

  // Course form
  const [courseForm, setCourseForm] = useState({ title: '', description: '', tags: '', courseType: 'free' as 'free' | 'paid' });
  const [coverImage, setCoverImage] = useState<{ url: string; publicId: string }>({ url: '', publicId: '' });
  const [uploadingCover, setUploadingCover] = useState(false);

  const load = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await learningService.instructorCourseDetail(courseId);
      if (res.data) {
        const c = res.data as Course & { lessons: Lesson[] };
        setCourse(c);
        setCourseForm({ title: c.title, description: c.description || '', tags: (c.tags || []).join(', '), courseType: c.courseType || 'free' });
        setCoverImage(c.coverImage || { url: '', publicId: '' });
      }
    } catch {}
    setLoading(false);
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await learningService.deleteLesson(lessonId);
      load();
    } catch {}
  };

  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    setUploadingCover(true);
    setError('');
    try {
      const res = await learningService.uploadCover(file);
      if (res.data) {
        setCoverImage({ url: res.data.url, publicId: res.data.publicId });
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    }
    setUploadingCover(false);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await learningService.updateCourse(courseId, {
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        tags: courseForm.tags ? courseForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        courseType: courseForm.courseType,
        coverImage,
      });
      if (res.data) setCourse(prev => ({ ...(res.data as Course & { lessons: Lesson[] }), lessons: prev?.lessons || [] }));
    } catch (err: any) {
      setError(err.message || 'Failed to save course');
    }
    setSaving(false);
  };

  const handlePublishChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!course) return;
    const isPublished = e.target.value === 'published';
    setSaving(true);
    setError('');
    try {
      const res = await learningService.updateCourse(courseId, { isPublished });
      if (res.data) setCourse(prev => ({ ...(res.data as Course & { lessons: Lesson[] }), lessons: prev?.lessons || [] }));
    } catch (err: any) {
      setError(err.message || 'Failed to update publish status');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-white/5 rounded-xl animate-pulse w-1/3" />
        <div className="h-4 bg-white/5 rounded-xl animate-pulse w-1/2" />
        <div className="h-64 bg-white/5 rounded-xl animate-pulse mt-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/instructor/courses" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-bold mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Courses
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black tracking-tight">{course?.title}</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-white/5">
        <button
          onClick={() => setTab('lessons')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            tab === 'lessons' ? 'border-success text-success' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          Lessons
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            tab === 'settings' ? 'border-success text-success' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </button>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger font-bold mb-6">
          {error}
        </div>
      )}

      {/* Lessons Tab */}
      {tab === 'lessons' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm">Lessons</h2>
            <Link
              href={`/instructor/courses/${courseId}/lessons/new`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success font-bold text-xs rounded-lg hover:bg-success/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Lesson
            </Link>
          </div>

          {(course?.lessons || []).length === 0 && (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
              <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
              <p className="text-xs text-muted-foreground font-bold">No lessons yet</p>
              <Link href={`/instructor/courses/${courseId}/lessons/new`} className="text-xs text-success font-bold mt-1 inline-block">Add your first lesson</Link>
            </div>
          )}

          <div className="space-y-1">
            {(course?.lessons || []).map((lesson, idx) => (
              <div key={lesson._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group border border-transparent hover:border-white/5">
                <span className="text-[10px] text-muted-foreground font-bold w-5 text-right shrink-0">{idx + 1}</span>
                <Video className="w-4 h-4 text-primary/60 shrink-0" />
                <Link
                  href={`/instructor/courses/${courseId}/lessons/${lesson._id}`}
                  className="flex-1 text-sm font-bold hover:text-success transition-colors"
                >
                  {lesson.title}
                </Link>
                {lesson.duration > 0 && (
                  <span className="text-[10px] text-muted-foreground">{lesson.duration} min</span>
                )}
                <Link
                  href={`/instructor/courses/${courseId}/lessons/${lesson._id}`}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                  title="Edit lesson"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleDeleteLesson(lesson._id)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete lesson"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          {/* Cover Image */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">Cover Image</label>
            <div
              onClick={() => (document.getElementById('cover-upload-input') as HTMLInputElement)?.click()}
              className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all ${
                uploadingCover ? 'border-success bg-success/5' : coverImage.url ? 'border-white/10' : 'border-white/10 hover:border-success/50 hover:bg-white/[0.02]'
              }`}
            >
              <input
                id="cover-upload-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                }}
              />

              {uploadingCover ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <Loader2 className="w-8 h-8 text-success animate-spin" />
                  <p className="text-sm font-bold text-foreground">Uploading...</p>
                </div>
              ) : coverImage.url ? (
                <div className="relative group">
                  <img src={coverImage.url} alt="Cover" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-white mx-auto mb-1" />
                      <p className="text-xs text-white font-bold">Click to change</p>
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setCoverImage({ url: '', publicId: '' });
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-bold text-foreground">Click to upload cover image</p>
                  <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Course Details */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">Course Title *</label>
            <input
              type="text"
              value={courseForm.title}
              onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
              placeholder="e.g., Crypto Trading Fundamentals"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">Description</label>
            <textarea
              value={courseForm.description}
              onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50 resize-none"
              placeholder="Describe what students will learn..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">Tags (comma-separated)</label>
            <input
              type="text"
              value={courseForm.tags}
              onChange={e => setCourseForm(p => ({ ...p, tags: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
              placeholder="e.g., beginner, crypto, trading"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">Course Type</label>
            <select
              value={courseForm.courseType}
              onChange={e => setCourseForm(p => ({ ...p, courseType: e.target.value as 'free' | 'paid' }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">Status</label>
            <select
              value={course?.isPublished ? 'published' : 'draft'}
              onChange={handlePublishChange}
              disabled={saving}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-success/50 disabled:opacity-50"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleSaveCourse}
              disabled={saving}
              className="px-6 py-2.5 bg-success text-white font-bold text-sm rounded-xl hover:bg-success/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
