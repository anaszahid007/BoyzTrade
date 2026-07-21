import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const AttachmentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, default: '' },
  type: { type: String, default: '' },
}, { _id: false });

const LessonSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  videoUrl: { type: String, default: '' },
  videoPublicId: { type: String, default: '' },
  content: { type: String, default: '' },
  attachments: [AttachmentSchema],
  order: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
}, { timestamps: true });

LessonSchema.index({ course: 1, order: 1 });

export default model('Lesson', LessonSchema);
