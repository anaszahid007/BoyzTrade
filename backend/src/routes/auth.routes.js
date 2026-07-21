import { Router } from 'express';

// Middlewares
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter, apiLimiter } from '../middleware/rateLimiter.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

// Validators
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    changePasswordSchema,
    updateSettingsSchema,
    surveySchema
} from '../validators/auth.validator.js';

// Controllers
import * as authController from '../controllers/auth.controller.js';
import * as profileController from '../controllers/profile.controller.js';


const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @input { email, fullName, password }
*/
router.post('/register', authLimiter, validate(registerSchema), authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login an existing user
 * @access Public
 * @input { email, password }
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * @route POST /api/auth/logout
 * @desc Logout user by revoking refresh token
 * @access Public (client needs to send refresh token)
*/
router.post('/logout', authLimiter, authController.logout);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh user's access token
 * @access Public (client needs to send refresh token)
*/
router.post('/refresh', authLimiter, authController.refresh);

/**
 * @route GET /api/auth/verify-email
 * @desc Verify a user's email address
 * @access Public
 * @query { token, next }
 */
router.get('/verify-email', authLimiter, authController.verifyEmail);

/**
 * @route POST /api/auth/resend-verification
 * @desc Resend verification email
 * @access Public
 */
router.post('/resend-verification', authLimiter, authController.resendVerification);

/**
 * @route POST /api/auth/forgot-password
 * @desc Initiate forgot password flow
 * @access Public
 * @input { email }
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset user's password
 * @access Public
 * @input { token, password }
 */
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

/**
 * @route GET /api/auth/me
 * @desc Get current user's profile
 * @access Private
 */
router.get('/me', protect, apiLimiter, profileController.me);

/**
 * @route PATCH /api/auth/profile
 * @desc Update user profile (fullName)
 * @access Private
 */
router.patch('/profile', protect, apiLimiter, validate(updateProfileSchema), profileController.updateProfile);

/**
 * @route PATCH /api/auth/password
 * @desc Change password while logged in
 * @access Private
 */
router.patch('/password', protect, apiLimiter, validate(changePasswordSchema), profileController.changePassword);

/**
 * @route PATCH /api/auth/settings
 * @desc Update user settings
 * @access Private
 */
router.patch('/settings', protect, apiLimiter, validate(updateSettingsSchema), profileController.updateSettings);

/**
 * @route PATCH /api/auth/survey
 * @desc Submit onboarding survey
 * @access Private
 */
router.patch('/survey', protect, apiLimiter, validate(surveySchema), profileController.submitSurvey);

export default router;
