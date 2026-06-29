import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createCourseSchema,
  updateCourseSchema,
  reorderSchema,
  createLessonSchema,
  updateLessonSchema,
} from '../validators/learning.validator.js';
import * as ctrl from '../controllers/learning.controller.js';

const router = Router();

// ── Public routes (no auth required) ──
router.get('/public/courses', ctrl.browseCourses);
router.get('/public/courses/:courseId', ctrl.getPublicCourseDetail);

// ── Student routes ──
router.get('/courses', protect, ctrl.browseCourses);
router.get('/courses/:courseId', protect, ctrl.getCourseDetail);
router.post('/courses/:courseId/enroll', protect, ctrl.enroll);
router.get('/courses/:courseId/progress', protect, ctrl.getMyProgress);
router.patch('/lessons/:lessonId/complete', protect, ctrl.completeLesson);
router.get('/lessons/:lessonId/stream', protect, ctrl.streamVideo);

// ── Instructor routes ──
const instructor = Router();
instructor.use(protect, requireRole('instructor', 'admin'));

instructor.get('/courses', ctrl.instructorCourses);
instructor.get('/courses/:courseId', ctrl.instructorCourseDetail);
instructor.post('/courses', validate(createCourseSchema), ctrl.createCourse);
instructor.patch('/courses/:courseId', validate(updateCourseSchema), ctrl.updateCourse);
instructor.delete('/courses/:courseId', ctrl.deleteCourse);

instructor.get('/lessons/:lessonId', ctrl.getLesson);
instructor.post('/courses/:courseId/lessons', validate(createLessonSchema), ctrl.createLesson);
instructor.patch('/lessons/:lessonId', validate(updateLessonSchema), ctrl.updateLesson);
instructor.delete('/lessons/:lessonId', ctrl.deleteLesson);
instructor.patch('/courses/:courseId/lessons/reorder', validate(reorderSchema), ctrl.reorderLessons);

router.use('/instructor', instructor);

// ── Admin routes ──
const adminRouter = Router();
adminRouter.use(protect, requireRole('admin'));

adminRouter.get('/instructors', ctrl.adminInstructors);
adminRouter.get('/instructors/:userId/courses', ctrl.adminInstructorCourses);
adminRouter.get('/admin/courses', ctrl.adminAllCourses);
adminRouter.patch('/admin/courses/:courseId/toggle-publish', ctrl.adminTogglePublish);

router.use('/admin', adminRouter);

export default router;
