import apiFetch, { apiUpload, ApiResponse } from "@/utils/api";

export interface Course {
  _id: string;
  title: string;
  description: string;
  coverImage: { url: string; publicId: string };
  instructor: { _id: string; fullName: string; email: string };
  tags: string[];
  courseType: 'free' | 'paid';
  isPublished: boolean;
  createdAt: string;
  lessons?: Lesson[];
  enrollmentCount?: number;
  lessonCount?: number;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  course: string;
  videoUrl: string;
  videoPublicId?: string;
  content: string;
  attachments: { name: string; url: string; publicId: string; type: string }[];
  order: number;
  duration: number;
  completed?: boolean;
}

export interface Enrollment {
  _id: string;
  student: string;
  course: string;
  progress: number;
  completedAt: string | null;
}

export interface Progress {
  enrollment: Enrollment;
  totalLessons: number;
  completedCount: number;
  lessons: (Lesson & { completed: boolean })[];
}

export interface Instructor {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export const learningService = {
  // Public
  async browsePublicCourses(): Promise<ApiResponse<Course[]>> {
    return apiFetch('/api/learning/public/courses', { method: 'GET' });
  },
  async getPublicCourseDetail(courseId: string): Promise<ApiResponse<Course>> {
    return apiFetch(`/api/learning/public/courses/${courseId}`, { method: 'GET' });
  },

  // Student
  async browseCourses(): Promise<ApiResponse<Course[]>> {
    return apiFetch('/api/learning/courses', { method: 'GET' });
  },
  async getCourseDetail(courseId: string): Promise<ApiResponse<Course>> {
    return apiFetch(`/api/learning/courses/${courseId}`, { method: 'GET' });
  },
  async enroll(courseId: string): Promise<ApiResponse<Enrollment>> {
    return apiFetch(`/api/learning/courses/${courseId}/enroll`, { method: 'POST' });
  },
  async getProgress(courseId: string): Promise<ApiResponse<Progress>> {
    return apiFetch(`/api/learning/courses/${courseId}/progress`, { method: 'GET' });
  },
  async completeLesson(lessonId: string): Promise<ApiResponse<any>> {
    return apiFetch(`/api/learning/lessons/${lessonId}/complete`, { method: 'PATCH' });
  },

  // Instructor
  async myCourses(): Promise<ApiResponse<Course[]>> {
    return apiFetch('/api/learning/instructor/courses', { method: 'GET' });
  },
  async instructorCourseDetail(courseId: string): Promise<ApiResponse<Course>> {
    return apiFetch(`/api/learning/instructor/courses/${courseId}`, { method: 'GET' });
  },
  async createCourse(data: Partial<Course>): Promise<ApiResponse<Course>> {
    return apiFetch('/api/learning/instructor/courses', { method: 'POST', data });
  },
  async updateCourse(courseId: string, data: Partial<Course>): Promise<ApiResponse<Course>> {
    return apiFetch(`/api/learning/instructor/courses/${courseId}`, { method: 'PATCH', data });
  },
  async deleteCourse(courseId: string): Promise<ApiResponse<any>> {
    return apiFetch(`/api/learning/instructor/courses/${courseId}`, { method: 'DELETE' });
  },
  async getLesson(lessonId: string): Promise<ApiResponse<Lesson>> {
    return apiFetch(`/api/learning/instructor/lessons/${lessonId}`, { method: 'GET' });
  },
  async createLesson(courseId: string, data: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
    return apiFetch(`/api/learning/instructor/courses/${courseId}/lessons`, { method: 'POST', data });
  },
  async updateLesson(lessonId: string, data: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
    return apiFetch(`/api/learning/instructor/lessons/${lessonId}`, { method: 'PATCH', data });
  },
  async createLessonWithVideo(courseId: string, formData: FormData): Promise<ApiResponse<Lesson>> {
    return apiUpload(`/api/learning/instructor/courses/${courseId}/lessons`, formData, { method: 'POST' });
  },
  async updateLessonWithVideo(lessonId: string, formData: FormData): Promise<ApiResponse<Lesson>> {
    return apiUpload(`/api/learning/instructor/lessons/${lessonId}`, formData, { method: 'PATCH' });
  },
  async deleteLesson(lessonId: string): Promise<ApiResponse<any>> {
    return apiFetch(`/api/learning/instructor/lessons/${lessonId}`, { method: 'DELETE' });
  },
  async reorderLessons(courseId: string, items: { id: string; order: number }[]): Promise<ApiResponse<Lesson[]>> {
    return apiFetch(`/api/learning/instructor/courses/${courseId}/lessons/reorder`, { method: 'PATCH', data: { items } });
  },

  // Upload
  async getVideoStream(lessonId: string): Promise<ApiResponse<{ url: string; expiresAt: number }>> {
    return apiFetch(`/api/learning/lessons/${lessonId}/stream`, { method: 'GET' });
  },
  async uploadVideo(file: File, onProgress?: (pct: number) => void): Promise<ApiResponse<{ url: string; publicId: string; previewUrl: string; duration: number; format: string; width: number; height: number }>> {
    const formData = new FormData();
    formData.append('video', file);
    return apiUpload('/api/upload/video', formData);
  },
  async uploadCover(file: File): Promise<ApiResponse<{ url: string; publicId: string; format: string; width: number; height: number }>> {
    const formData = new FormData();
    formData.append('cover', file);
    return apiUpload('/api/upload/cover', formData);
  },

  // Admin
  async getInstructors(): Promise<ApiResponse<Instructor[]>> {
    return apiFetch('/api/learning/admin/instructors', { method: 'GET' });
  },
  async getInstructorCourses(userId: string): Promise<ApiResponse<Course[]>> {
    return apiFetch(`/api/learning/admin/instructors/${userId}/courses`, { method: 'GET' });
  },
  async adminAllCourses(): Promise<ApiResponse<Course[]>> {
    return apiFetch('/api/learning/admin/courses', { method: 'GET' });
  },
  async togglePublish(courseId: string): Promise<ApiResponse<Course>> {
    return apiFetch(`/api/learning/admin/courses/${courseId}/toggle-publish`, { method: 'PATCH' });
  },
};
