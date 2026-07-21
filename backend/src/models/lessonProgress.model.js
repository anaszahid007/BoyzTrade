import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const LessonProgressSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

LessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

export default model('LessonProgress', LessonProgressSchema);
