import Lesson from '../../models/lesson.model.js';
import Course from '../../models/course.model.js';
import Enrollment from '../../models/enrollment.model.js';
import cloudinary from '../../config/cloudinary.js';
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

export const create = async (courseId, data, userId, isAdmin) => {
  await verifyCourseAccess(courseId, userId, isAdmin);
  const maxOrder = await Lesson.findOne({ course: courseId }).sort({ order: -1 }).select('order').lean();
  return Lesson.create({ ...data, course: courseId, order: (maxOrder?.order ?? -1) + 1 });
};

export const update = async (lessonId, data, userId, isAdmin) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new ErrorResponse(404, 'Lesson not found');
  await verifyCourseAccess(lesson.course, userId, isAdmin);
  const updated = await Lesson.findByIdAndUpdate(lessonId, data, { new: true, runValidators: true });
  return updated;
};

export const remove = async (lessonId, userId, isAdmin) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new ErrorResponse(404, 'Lesson not found');
  await verifyCourseAccess(lesson.course, userId, isAdmin);
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

function extractPublicId(videoUrl) {
  try {
    const url = new URL(videoUrl);
    const pathParts = url.pathname.split('/');
    const versionIdx = pathParts.findIndex(p => /^v\d+$/.test(p));
    if (versionIdx === -1) return null;
    return pathParts.slice(versionIdx + 1).join('/').replace(/\.[^.]+$/, '');
  } catch {
    return null;
  }
}

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
  const url = cloudinary.url(publicId, {
    resource_type: 'video',
    type,
    sign_url: true,
    expires_at: expiresAt,
  });

  return { url, expiresAt };
};
