import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { uploadVideo, uploadCover } from '../middleware/upload.middleware.js';
import * as ctrl from '../controllers/upload.controller.js';

const router = Router();

router.post('/video', protect, requireRole('instructor', 'admin'), uploadVideo, ctrl.uploadVideo);
router.post('/cover', protect, requireRole('instructor', 'admin'), uploadCover, ctrl.uploadCover);

export default router;
