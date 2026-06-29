import * as learningService from '../services/learning/index.js';
import Response from '../utils/Response.js';
import asyncHandler from '../utils/asyncHandler.js';

// ── Student ──

export const browseCourses = asyncHandler(async (req, res) => {
  const data = await learningService.listPublished();
  return Response.success(res, data, 'Courses retrieved');
});

export const getPublicCourseDetail = asyncHandler(async (req, res) => {
  const data = await learningService.getPublicDetail(req.params.courseId);
  return Response.success(res, data, 'Course detail retrieved');
});

export const getCourseDetail = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const data = await learningService.getPublishedDetail(req.params.courseId, req.user._id, isAdmin);
  return Response.success(res, data, 'Course detail retrieved');
});

export const enroll = asyncHandler(async (req, res) => {
  const data = await learningService.enroll(req.user._id, req.params.courseId);
  return Response.success(res, data, 'Enrolled successfully', 201);
});

export const getMyProgress = asyncHandler(async (req, res) => {
  const data = await learningService.getProgress(req.user._id, req.params.courseId);
  return Response.success(res, data, 'Progress retrieved');
});

export const streamVideo = asyncHandler(async (req, res) => {
  const data = await learningService.streamVideo(req.params.lessonId, req.user._id);
  return Response.success(res, data, 'Video stream URL generated');
});

export const completeLesson = asyncHandler(async (req, res) => {
  const data = await learningService.completeLesson(req.user._id, req.params.lessonId);
  return Response.success(res, data, 'Lesson completed');
});

// ── Instructor ──

export const instructorCourses = asyncHandler(async (req, res) => {
  const data = await learningService.listByInstructor(req.user._id);
  return Response.success(res, data, 'Courses retrieved');
});

export const instructorCourseDetail = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const data = await learningService.getInstructorDetail(req.params.courseId, req.user._id, isAdmin);
  return Response.success(res, data, 'Course detail retrieved');
});

export const createCourse = asyncHandler(async (req, res) => {
  const data = await learningService.createCourse(req.body, req.user._id);
  return Response.success(res, data, 'Course created', 201);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const data = await learningService.updateCourse(req.params.courseId, req.body, req.user._id, isAdmin);
  return Response.success(res, data, 'Course updated');
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  await learningService.removeCourse(req.params.courseId, req.user._id, isAdmin);
  return Response.success(res, null, 'Course deleted');
});

export const getLesson = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const data = await learningService.getLesson(req.params.lessonId, req.user._id, isAdmin);
  return Response.success(res, data, 'Lesson retrieved');
});

export const createLesson = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const data = await learningService.createLesson(req.params.courseId, req.body, req.user._id, isAdmin);
  return Response.success(res, data, 'Lesson created', 201);
});

export const updateLesson = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const data = await learningService.updateLesson(req.params.lessonId, req.body, req.user._id, isAdmin);
  return Response.success(res, data, 'Lesson updated');
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  await learningService.removeLesson(req.params.lessonId, req.user._id, isAdmin);
  return Response.success(res, null, 'Lesson deleted');
});

export const reorderLessons = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const data = await learningService.reorderLessons(req.params.courseId, req.body.items, req.user._id, isAdmin);
  return Response.success(res, data, 'Lessons reordered');
});

// ── Admin ──

export const adminInstructors = asyncHandler(async (req, res) => {
  const User = (await import('../models/user.model.js')).default;
  const instructors = await User.find({ role: 'instructor' }).select('fullName email createdAt').lean();
  return Response.success(res, instructors, 'Instructors retrieved');
});

export const adminInstructorCourses = asyncHandler(async (req, res) => {
  const data = await learningService.listByInstructor(req.params.userId);
  return Response.success(res, data, 'Instructor courses retrieved');
});

export const adminAllCourses = asyncHandler(async (req, res) => {
  const data = await learningService.listAll();
  return Response.success(res, data, 'All courses retrieved');
});

export const adminTogglePublish = asyncHandler(async (req, res) => {
  const data = await learningService.togglePublish(req.params.courseId);
  return Response.success(res, data, 'Course publish status toggled');
});
