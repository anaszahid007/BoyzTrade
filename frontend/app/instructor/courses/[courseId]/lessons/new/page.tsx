"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Video, FileText, Plus, X, Upload, Loader2 } from "lucide-react";
import { learningService } from "@/services/learning";
import MarkdownEditor from "@/components/ui/MarkdownEditor";

export default function NewLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPublicId, setVideoPublicId] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [newAttachName, setNewAttachName] = useState('');
  const [newAttachUrl, setNewAttachUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleAddAttachment = () => {
    if (!newAttachName.trim() || !newAttachUrl.trim()) return;
    setAttachments(prev => [...prev, { name: newAttachName.trim(), url: newAttachUrl.trim() }]);
    setNewAttachName('');
    setNewAttachUrl('');
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUploadVideo = async (file: File) => {
    if (!file.type.startsWith('video/')) { setError('Please select a video file'); return; }
    if (file.size > 200 * 1024 * 1024) { setError('Video must be under 200MB'); return; }
    setUploading(true);
    setError('');
    try {
      const res = await learningService.uploadVideo(file);
      if (res.data) {
        setVideoUrl(res.data.url);
        setVideoPublicId(res.data.publicId);
        if (res.data.duration) setDuration(String(res.data.duration));
      }
      if (res.data?.previewUrl) setPreviewUrl(res.data.previewUrl);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadVideo(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadVideo(file);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload: any = { title: title.trim(), content, videoUrl, videoPublicId, duration: Number(duration) || 0, attachments };
      const res = await learningService.createLesson(courseId, payload);
      if (res.data?._id) {
        router.push(`/instructor/courses/${courseId}/lessons/${res.data._id}`);
      } else {
        router.push(`/instructor/courses/${courseId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create lesson');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href={`/instructor/courses/${courseId}`}
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-bold mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Course Builder
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black tracking-tight">New Lesson</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-success text-white font-bold text-sm rounded-xl hover:bg-success/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Creating...' : 'Create Lesson'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger font-bold mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">Lesson Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
            placeholder="e.g., Introduction to Candlesticks"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">
            <Video className="w-3 h-3 inline mr-1" />
            Video
          </label>

          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => (document.getElementById('video-upload-input') as HTMLInputElement)?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-3 ${dragOver ? 'border-success bg-success/5' : videoUrl ? 'border-white/10 bg-white/[0.02]' : 'border-white/10 hover:border-success/50 hover:bg-white/[0.02]'}`}
          >
            <input
              id="video-upload-input"
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska,video/ogg"
              className="hidden"
              onChange={handleFileSelect}
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-success animate-spin" />
                <p className="text-sm font-bold text-foreground">Uploading...</p>
                <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            ) : videoUrl ? (
              <div className="flex flex-col items-center gap-2">
                <Video className="w-8 h-8 text-success" />
                <p className="text-sm font-bold text-foreground">Video uploaded</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-full">{videoUrl}</p>
                <button
                  onClick={e => { e.stopPropagation(); setVideoUrl(''); }}
                  className="text-[10px] text-danger font-bold hover:underline mt-1"
                >
                  Remove & re-upload
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-bold text-foreground">Drop a video here or click to browse</p>
                <p className="text-[10px] text-muted-foreground">MP4, MOV, WebM, AVI up to 200MB</p>
              </div>
            )}
          </div>

          {/* Preview */}
          {videoUrl && previewUrl && (
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-3 border border-white/5">
              <iframe src={previewUrl} className="w-full h-full" allowFullScreen allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
          )}

          {/* Manual URL fallback */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
              placeholder="Or paste a video URL manually..."
            />
            <input
              type="text"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
              placeholder="Duration"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">
            <FileText className="w-3 h-3 inline mr-1" />
            Lesson Content (Markdown)
          </label>
          <MarkdownEditor value={content} onChange={setContent} />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">Attachments</label>
          <div className="space-y-2 mb-3">
            {attachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl border border-white/5 group">
                <FileText className="w-4 h-4 text-primary/60 shrink-0" />
                <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs font-bold hover:text-success transition-colors truncate">
                  {att.name}
                </a>
                <button
                  onClick={() => handleRemoveAttachment(idx)}
                  className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newAttachName}
              onChange={e => setNewAttachName(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
              placeholder="File name"
            />
            <input
              type="text"
              value={newAttachUrl}
              onChange={e => setNewAttachUrl(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/50"
              placeholder="File URL"
            />
            <button
              onClick={handleAddAttachment}
              className="p-2 bg-success/10 text-success rounded-xl hover:bg-success/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-8 pb-12">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-success text-white font-bold text-sm rounded-xl hover:bg-success/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Creating...' : 'Create Lesson'}
        </button>
        <Link
          href={`/instructor/courses/${courseId}`}
          className="px-6 py-2.5 bg-white/5 border border-white/10 text-foreground font-bold text-sm rounded-xl hover:bg-white/10 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
