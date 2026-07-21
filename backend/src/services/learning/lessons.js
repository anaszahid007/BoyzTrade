import Lesson from '../../models/lesson.model.js';
import Course from '../../models/course.model.js';
import Enrollment from '../../models/enrollment.model.js';
import { uploadVideo, deleteVideo, getSignedUrl, extractPublicId } from '../../services/cloudinary.service.js';
import ErrorResponse from '../../utils/ErrorResponse.js';

const verifyCourseAccess = async (courseId, userId, isAdmin) => {
  const course = await Course.findById(courseId);
  if (!course) throw new ErrorResponse(404, 'Course not found');
  if (!isAdmin && course.instructor.toString() !== userId.toString()) throw new ErrorResponse(403, 'Not authorized');
  return course;
};

export const getById = async (lessonId, userId, isAdmin) => {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw new ErrorResponse(404, 'Lesson not found');
  if (userId && !isAdmin) {
    await verifyCourseAccess(lesson.course, userId, isAdmin);
  }
  return lesson;
};

export const create = async (courseId, data, userId, isAdmin, file = null) => {
  await verifyCourseAccess(courseId, userId, isAdmin);

  const lessonData = { ...data };
  if (file) {
    const result = await uploadVideo(file.buffer);
    lessonData.videoUrl = result.secure_url;
    lessonData.videoPublicId = result.public_id;
    if (!lessonData.duration) lessonData.duration = Math.round(result.duration || 0);
  }

  const maxOrder = await Lesson.findOne({ course: courseId }).sort({ order: -1 }).select('order').lean();
  return Lesson.create({ ...lessonData, course: courseId, order: (maxOrder?.order ?? -1) + 1 });
};

export const update = async (lessonId, data, userId, isAdmin, file = null) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new ErrorResponse(404, 'Lesson not found');
  await verifyCourseAccess(lesson.course, userId, isAdmin);

  const updateData = { ...data };
  if (file) {
    const oldPublicId = lesson.videoPublicId || extractPublicId(lesson.videoUrl);
    if (oldPublicId) {
      const type = lesson.videoPublicId ? 'authenticated' : 'upload';
      await deleteVideo(oldPublicId, { type });
    }
    const result = await uploadVideo(file.buffer);
    updateData.videoUrl = result.secure_url;
    updateData.videoPublicId = result.public_id;
    if (!updateData.duration) updateData.duration = Math.round(result.duration || 0);
  }

  const updated = await Lesson.findByIdAndUpdate(lessonId, updateData, { new: true, runValidators: true });
  return updated;
};

export const remove = async (lessonId, userId, isAdmin) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new ErrorResponse(404, 'Lesson not found');
  await verifyCourseAccess(lesson.course, userId, isAdmin);

  const publicId = lesson.videoPublicId || extractPublicId(lesson.videoUrl);
  if (publicId) {
    const type = lesson.videoPublicId ? 'authenticated' : 'upload';
    const check = await deleteVideo(publicId, { type });
    if (check.result !== 'ok' && check.result !== 'not found') {
      console.error('Cloudinary deletion error:', check);
    }
  }

  await Lesson.findByIdAndDelete(lessonId);
  return lesson;
};

export const reorder = async (courseId, items, userId, isAdmin) => {
  await verifyCourseAccess(courseId, userId, isAdmin);
  const ops = items.map(({ id, order }) => ({
    updateOne: { filter: { _id: id, course: courseId }, update: { order } },
  }));
  await Lesson.bulkWrite(ops);
  return Lesson.find({ course: courseId }).sort({ order: 1 }).lean();
};

export const streamVideo = async (lessonId, userId) => {
  const lesson = await Lesson.findById(lessonId).populate('course');
  if (!lesson) throw new ErrorResponse(404, 'Lesson not found');
  if (!lesson.videoPublicId && !lesson.videoUrl) throw new ErrorResponse(400, 'No video available');

  const course = lesson.course;
  const isOwner = course.instructor.toString() === userId.toString();
  const isEnrolled = !isOwner && await Enrollment.findOne({ student: userId, course: course._id }).lean();
  if (!isOwner && !isEnrolled) throw new ErrorResponse(403, 'Access denied');

  const publicId = lesson.videoPublicId || extractPublicId(lesson.videoUrl);
  if (!publicId) throw new ErrorResponse(400, 'No video available');

  const type = lesson.videoPublicId ? 'authenticated' : 'upload';
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const url = getSignedUrl(publicId, { type, expiresAt });

  return { url, expiresAt };
};
