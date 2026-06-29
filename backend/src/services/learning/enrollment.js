import Enrollment from '../../models/enrollment.model.js';
import LessonProgress from '../../models/lessonProgress.model.js';
import Lesson from '../../models/lesson.model.js';
import Course from '../../models/course.model.js';
import ErrorResponse from '../../utils/ErrorResponse.js';
import { awardXP } from '../gamification/profile.js';
import { evaluateBadges } from '../gamification/badges.js';
import { updateQuestProgress } from '../gamification/quests.js';
import UserGamification from '../../models/userGamification.model.js';

export const enroll = async (studentId, courseId) => {
  const course = await Course.findOne({ _id: courseId, isPublished: true });
  if (!course) throw new ErrorResponse(404, 'Course not found');

  const existing = await Enrollment.findOne({ student: studentId, course: courseId });
  if (existing) return existing;

  return Enrollment.create({ student: studentId, course: courseId });
};

export const getProgress = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  if (!enrollment) throw new ErrorResponse(404, 'Not enrolled in this course');

  const allLessons = await Lesson.find({ course: courseId }).sort({ order: 1 }).lean();
  const lessonIds = allLessons.map(l => l._id);

  const completedLessons = await LessonProgress.find({
    student: studentId,
    lesson: { $in: lessonIds },
    completed: true,
  }).lean();
  const completedIds = new Set(completedLessons.map(cp => cp.lesson.toString()));

  const lessonsWithStatus = allLessons.map(lesson => ({
    ...lesson,
    completed: completedIds.has(lesson._id.toString()),
  }));

  return {
    enrollment,
    totalLessons: allLessons.length,
    completedCount: completedLessons.length,
    lessons: lessonsWithStatus,
  };
};

export const completeLesson = async (studentId, lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new ErrorResponse(404, 'Lesson not found');

  const enrollment = await Enrollment.findOne({ student: studentId, course: lesson.course });
  if (!enrollment) throw new ErrorResponse(403, 'Not enrolled in this course');

  let progress = await LessonProgress.findOne({ student: studentId, lesson: lessonId });
  if (progress?.completed) return progress;

  progress = await LessonProgress.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    { $set: { completed: true, completedAt: new Date() } },
    { upsert: true, new: true },
  );

  awardXP(studentId, 10, `lesson_${lessonId}`).catch(() => {});

  UserGamification.findOneAndUpdate(
    { userId: studentId },
    { $inc: { lessonsCompleted: 1 } },
  ).catch(() => {});

  evaluateBadges(studentId).catch(() => {});
  updateQuestProgress(studentId, 'complete_lesson', 1).catch(() => {});

  const courseId = lesson.course;
  const allLessonIds = (await Lesson.find({ course: courseId }).select('_id').lean()).map(l => l._id);
  const totalLessons = allLessonIds.length;
  const completedCount = await LessonProgress.countDocuments({
    student: studentId,
    lesson: { $in: allLessonIds },
    completed: true,
  });
  const pct = Math.round((completedCount / totalLessons) * 100);

  const done = pct >= 100;
  await Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId },
    { $set: { progress: pct, ...(done ? { completedAt: new Date() } : {}) } },
  );

  return progress;
};
