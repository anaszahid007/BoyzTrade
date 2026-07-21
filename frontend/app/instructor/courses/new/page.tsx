"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { learningService } from "@/services/learning";

export default function CreateCoursePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: '', description: '', tags: '', courseType: 'free' as 'free' | 'paid' });
  const [coverImage, setCoverImage] = useState<{ url: string; publicId: string }>({ url: '', publicId: '' });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    setUploading(true);
    setError('');
    try {
      const res = await learningService.uploadCover(file);
      if (res.data) {
        setCoverImage({ url: res.data.url, publicId: res.data.publicId });
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await learningService.createCourse({
        title: form.title.trim(),
        description: form.description.trim(),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        courseType: form.courseType,
        coverImage: coverImage.url ? coverImage : undefined,
      });
      if (res.data) {
        router.push(`/instructor/courses/${(res.data as any)._id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/instructor/courses" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-bold mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Courses
      </Link>

      <h1 className="text-2xl font-black tracking-tight mb-8">Create New Course</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger font-bold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">Course Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
            placeholder="e.g., Crypto Trading Fundamentals"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50 resize-none"
            placeholder="Describe what students will learn..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">Tags (comma-separated)</label>
          <input
            type="text"
            value={form.tags}
            onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
            placeholder="e.g., beginner, crypto, trading"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">Cover Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
          />
          {uploading ? (
            <div className="flex items-center justify-center h-36 bg-white/5 border border-dashed border-white/10 rounded-xl">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : coverImage.url ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={coverImage.url} alt="Cover" className="w-full h-36 object-cover" />
              <button
                type="button"
                onClick={() => setCoverImage({ url: '', publicId: '' })}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 w-full h-36 bg-white/5 border border-dashed border-white/10 rounded-xl hover:border-success/50 hover:bg-white/[0.02] transition-colors"
            >
              <ImageIcon className="w-8 h-8 text-muted-foreground/60" />
              <p className="text-sm font-bold text-muted-foreground">Click to upload cover image</p>
              <p className="text-[10px] text-muted-foreground/60">PNG, JPG, WebP up to 5MB</p>
            </button>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">Course Type</label>
          <select
            value={form.courseType}
            onChange={e => setForm(p => ({ ...p, courseType: e.target.value as 'free' | 'paid' }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
          >
            <option value="free">Free</option>
            <option value="paid" disabled className="text-muted-foreground">Paid (coming soon)</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-success text-white font-bold text-sm rounded-xl hover:bg-success/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
          <Link
            href="/instructor/courses"
            className="px-6 py-2.5 bg-white/5 border border-white/10 text-foreground font-bold text-sm rounded-xl hover:bg-white/10 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
