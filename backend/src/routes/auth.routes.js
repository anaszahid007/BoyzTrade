import { Router } from 'express';

// Controllers
import * as controller from '../controllers/auth.controller.js';

// Validators
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from '../validators/auth.validator.js';

// Middlewares
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @input { email, fullName, password }
*/
router.post('/register', authLimiter, validate(registerSchema), controller.register);

/**
 * @route POST /api/auth/login
 * @desc Login an existing user
 * @access Public
 * @input { email, password }
 */
router.post('/login', authLimiter, validate(loginSchema), controller.login);

/**
 * @route POST /api/auth/logout
 * @desc Logout user by revoking refresh token
 * @access Public (client needs to send refresh token)
*/
router.post('/logout', authLimiter, controller.logout);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh user's access token
 * @access Public (client needs to send refresh token)
*/
router.post('/refresh', authLimiter, controller.refresh);

/**
 * @route POST /api/auth/forgot-password
 * @desc Initiate forgot password flow
 * @access Public
 * @input { email }
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset user's password
 * @access Public
 * @input { token, password }
 */
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), controller.resetPassword);

/**
 * @route GET /api/auth/me
 * @desc Get current user's profile
 * @access Private
 */
router.get('/me', protect, controller.me);

export default router;
