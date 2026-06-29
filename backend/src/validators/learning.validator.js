import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  coverImage: z.object({ url: z.string(), publicId: z.string() }).optional(),
  tags: z.array(z.string()).optional(),
  courseType: z.enum(['free', 'paid']).optional(),
});

export const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  coverImage: z.object({ url: z.string(), publicId: z.string() }).optional(),
  tags: z.array(z.string()).optional(),
  courseType: z.enum(['free', 'paid']).optional(),
  isPublished: z.boolean().optional(),
});

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), order: z.number().int().nonnegative() })),
});

export const createLessonSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  videoPublicId: z.string().optional(),
  content: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    publicId: z.string().optional(),
    type: z.string().optional(),
  })).optional(),
  duration: z.number().int().nonnegative().optional(),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  videoPublicId: z.string().optional(),
  content: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    publicId: z.string().optional(),
    type: z.string().optional(),
  })).optional(),
  duration: z.number().int().nonnegative().optional(),
});

export default {
  createCourseSchema,
  updateCourseSchema,
  reorderSchema,
  createLessonSchema,
  updateLessonSchema,
};
