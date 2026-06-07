import { Router } from 'express';

// Middlewares
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

// Validators
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from '../validators/auth.validator.js';

// Controllers
import * as controller from '../controllers/auth.controller.js';


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
 * @route GET /api/auth/verify-email
 * @desc Verify a user's email address
 * @access Public
 * @query { token, next }
 */
router.get('/verify-email', authLimiter, controller.verifyEmail);

/**
 * @route POST /api/auth/resend-verification
 * @desc Resend verification email
 * @access Public
 */
router.post('/resend-verification', authLimiter, controller.resendVerification);

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
