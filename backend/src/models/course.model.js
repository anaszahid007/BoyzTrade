import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const CourseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  coverImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tags: [{ type: String }],
  courseType: { type: String, enum: ['free', 'paid'], default: 'free' },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

export default model('Course', CourseSchema);
