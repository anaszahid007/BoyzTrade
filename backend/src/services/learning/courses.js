import Course from '../../models/course.model.js';
import Lesson from '../../models/lesson.model.js';
import Enrollment from '../../models/enrollment.model.js';
import ErrorResponse from '../../utils/ErrorResponse.js';

const checkOwnership = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) throw new ErrorResponse(404, 'Course not found');
  if (course.instructor.toString() !== userId.toString()) throw new ErrorResponse(403, 'Not authorized to manage this course');
  return course;
};

export const listPublished = async () => {
  const courses = await Course.find({ isPublished: true })
    .populate('instructor', 'fullName email')
    .sort({ createdAt: -1 })
    .lean();

  const courseIds = courses.map(c => c._id);
  const lessonCounts = await Lesson.aggregate([
    { $match: { course: { $in: courseIds } } },
    { $group: { _id: '$course', count: { $sum: 1 } } },
  ]);
  const lessonMap = {};
  for (const l of lessonCounts) lessonMap[l._id.toString()] = l.count;

  return courses.map(c => ({ ...c, lessonCount: lessonMap[c._id.toString()] || 0 }));
};

export const getPublicDetail = async (courseId) => {
  const course = await Course.findOne({ _id: courseId, isPublished: true })
    .populate('instructor', 'fullName email')
    .lean();
  if (!course) throw new ErrorResponse(404, 'Course not found');

  const lessonCount = await Lesson.countDocuments({ course: courseId });

  return { ...course, lessonCount };
};

export const getPublishedDetail = async (courseId, userId, isAdmin = false) => {
  let course = await Course.findOne({ _id: courseId, isPublished: true })
    .populate('instructor', 'fullName email')
    .lean();

  if (!course && (userId || isAdmin)) {
    course = await Course.findById(courseId)
      .populate('instructor', 'fullName email')
      .lean();
    if (!course) throw new ErrorResponse(404, 'Course not found');
    const isOwner = course.instructor?._id?.toString() === userId.toString();
    const isEnrolled = !isOwner && await Enrollment.findOne({ student: userId, course: courseId }).lean();
    if (!isAdmin && !isOwner && !isEnrolled) throw new ErrorResponse(404, 'Course not found');
  } else if (!course) {
    throw new ErrorResponse(404, 'Course not found');
  }

  const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 }).lean();

  return {
    ...course,
    lessons,
  };
};

export const listByInstructor = async (instructorId) => {
  const courses = await Course.find({ instructor: instructorId })
    .sort({ createdAt: -1 })
    .lean();

  const courseIds = courses.map(c => c._id);

  const [enrollmentCounts, lessonCounts] = await Promise.all([
    Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
    Lesson.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
  ]);

  const enrollmentMap = {};
  for (const e of enrollmentCounts) enrollmentMap[e._id.toString()] = e.count;
  const lessonMap = {};
  for (const l of lessonCounts) lessonMap[l._id.toString()] = l.count;

  return courses.map(c => ({
    ...c,
    enrollmentCount: enrollmentMap[c._id.toString()] || 0,
    lessonCount: lessonMap[c._id.toString()] || 0,
  }));
};

export const getInstructorDetail = async (courseId, userId, isAdmin = false) => {
  const course = isAdmin ? await Course.findById(courseId) : await checkOwnership(courseId, userId);
  if (!course) throw new ErrorResponse(404, 'Course not found');
  const courseObj = course.toObject();

  const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 }).lean();

  const enrollmentCount = await Enrollment.countDocuments({ course: courseId });

  return {
    ...courseObj,
    enrollmentCount,
    lessons,
  };
};

export const create = async (data, instructorId) => {
  return Course.create({ ...data, instructor: instructorId });
};

export const update = async (courseId, data, userId, isAdmin) => {
  if (!isAdmin) await checkOwnership(courseId, userId);
  if (data.isPublished === true) {
    const lessonCount = await Lesson.countDocuments({ course: courseId });
    if (lessonCount === 0) throw new ErrorResponse(400, 'Cannot publish a course with no lessons');
  }
  const course = await Course.findByIdAndUpdate(courseId, data, { new: true, runValidators: true });
  if (!course) throw new ErrorResponse(404, 'Course not found');
  return course;
};

export const remove = async (courseId, userId, isAdmin) => {
  if (!isAdmin) await checkOwnership(courseId, userId);
  const enrollmentCount = await Enrollment.countDocuments({ course: courseId });
  if (enrollmentCount > 0) throw new ErrorResponse(400, 'Cannot delete course with active enrollments');

  await Lesson.deleteMany({ course: courseId });
  const course = await Course.findByIdAndDelete(courseId);
  if (!course) throw new ErrorResponse(404, 'Course not found');
  return course;
};

export const listAll = async () => {
  return Course.find().populate('instructor', 'fullName email').sort({ createdAt: -1 }).lean();
};

export const togglePublish = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) throw new ErrorResponse(404, 'Course not found');
  const willPublish = !course.isPublished;
  if (willPublish) {
    const lessonCount = await Lesson.countDocuments({ course: courseId });
    if (lessonCount === 0) throw new ErrorResponse(400, 'Cannot publish a course with no lessons');
  }
  course.isPublished = willPublish;
  await course.save();
  return course;
};
