import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const EnrollmentSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default model('Enrollment', EnrollmentSchema);
