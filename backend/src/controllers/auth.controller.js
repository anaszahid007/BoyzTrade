// Models
import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import VerificationToken from '../models/verificationToken.model.js';

// Config
import env from '../config/env.js';

// Utils
import jwtUtils from '../utils/jwt.js';
import sendMail from '../utils/sendMail.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateRandomToken, hashToken } from '../utils/crypto.js';


const cookieOptions = {
  httpOnly: true,
  secure: env.cookie.secure,
  sameSite: env.cookie.sameSite,
  domain: env.cookie.domain,
  maxAge: 30 * 24 * 60 * 60 * 1000
};

/**
 * Create access and refresh tokens for a user
 */
const createTokens = async (userId) => {
  const accessToken = jwtUtils.signAccessToken({ sub: userId });
  const rawRefresh = generateRandomToken();
  const tokenHash = hashToken(rawRefresh);

  // Parse refresh expiry - default 30 days
  const exp = env.jwt.refresh.expiresIn || '30d';
  let expiresAt;

  if (exp.endsWith('d')) {
    const days = Number(exp.slice(0, -1)) || 30;
    expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  } else {
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  return { accessToken, rawRefresh, tokenHash, expiresAt };
};

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @props {string} email - User's email
 * @props {string} fullName - User's full name
 * @props {string} password - User's password
 */
export const register = asyncHandler(async (req, res) => {
  const { email, fullName, password } = req.body;

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, 'Email already exists');

  // Create new user
  const user = new User({ email, fullName, password });
  await user.save();

  // Generate email verification token
  const verificationTokenRaw = generateRandomToken();
  const verificationTokenHash = hashToken(verificationTokenRaw);
  const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  await VerificationToken.create({
    userId: user._id,
    tokenHash: verificationTokenHash,
    expiresAt: verificationExpires
  });

  const verificationUrl = `${env.backendUrl}/api/auth/verify-email?token=${verificationTokenRaw}&next=${encodeURIComponent(
    `${env.clientUrl}/auth/verified`
  )}`;

  await sendMail({
    to: email,
    subject: 'Confirm your BoyzTrade email',
    html: `
      <p>Hi ${fullName},</p>
      <p>Welcome to BoyzTrade! Please confirm your email by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify my email</a></p>
      <p>If the link does not work, copy and paste the following URL into your browser:</p>
      <p>${verificationUrl}</p>
      <p>Thank you for joining BoyzTrade!</p>
    `
  });

  const userObj = { email: user.email, fullName: user.fullName, isVerified: user.isVerified };
  return ApiResponse.success(res, { user: userObj }, 'Registered successfully. Please verify your email before logging in.', 201);
});


/**
 * @desc Login a user
 * @route POST /api/auth/login
 * @access Public
 * @props {string} email - User's email
 * @props {string} password - User's password
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and get password hash
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');

  // Compare password
  const isValid = await user.comparePassword(password);
  if (!isValid) throw new ApiError(401, 'Invalid credentials');
  
  if (!user.isVerified) {
    // Generate new email verification token
    const verificationTokenRaw = generateRandomToken();
    const verificationTokenHash = hashToken(verificationTokenRaw);
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // Delete existing tokens first
    await VerificationToken.deleteMany({ userId: user._id });

    await VerificationToken.create({
      userId: user._id,
      tokenHash: verificationTokenHash,
      expiresAt: verificationExpires
    });

    const verificationUrl = `${env.backendUrl}/api/auth/verify-email?token=${verificationTokenRaw}&next=${encodeURIComponent(
      `${env.clientUrl}/auth/verified`
    )}`;

    await sendMail({
      to: user.email,
      subject: 'Confirm your BoyzTrade email',
      html: `
        <p>Hi ${user.fullName},</p>
        <p>Please confirm your email by clicking the link below:</p>
        <p><a href="${verificationUrl}">Verify my email</a></p>
        <p>If the link does not work, copy and paste the following URL into your browser:</p>
        <p>${verificationUrl}</p>
        <p>Thank you for using BoyzTrade!</p>
      `
    });

    return ApiResponse.error(res, 'Email not verified. A new verification link has been sent to your email.', 403, { 
      requiresVerification: true,
      email: user.email 
    });
  }

  // Create tokens
  const tokens = await createTokens(user._id);
  await RefreshToken.create({
    userId: user._id,
    tokenHash: tokens.tokenHash,
    expiresAt: tokens.expiresAt
  });

  // Remove sensitive fields from response
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.passwordHash;

  // For mobile clients return refresh token in response
  if (req.headers['x-client-type'] === 'mobile') {
    return ApiResponse.success(res, { user: userObj, accessToken: tokens.accessToken, refreshToken: tokens.rawRefresh }, 'Logged in');
  }

  // For web clients set cookies
  res.cookie('refreshToken', tokens.rawRefresh, cookieOptions);
  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  return ApiResponse.success(res, { user: userObj, accessToken: tokens.accessToken, refreshToken: tokens.rawRefresh }, 'Logged in');
});

/**
 * @desc Logout a user
 * @route POST /api/auth/logout
 * @access Public
 */
export const logout = asyncHandler(async (req, res) => {
  const raw = req.cookies?.refreshToken || req.body?.refreshToken;

  // Invalidate the refresh token
  if (raw) {
    const tokenHash = hashToken(raw);
    await RefreshToken.deleteOne({ tokenHash });
  }

  // Clear cookies
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
  return ApiResponse.success(res, null, 'Logged out');
});

/**
 * @desc Refresh access token
 * @route POST /api/auth/refresh
 * @access Public
 */
export const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!raw) {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    throw new ApiError(401, 'No refresh token');
  }

  // Verify refresh token exists and is not expired
  const tokenHash = hashToken(raw);
  const stored = await RefreshToken.findOne({ tokenHash });
  if (!stored) {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    throw new ApiError(401, 'Invalid refresh token');
  }
  if (stored.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: stored._id });
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    throw new ApiError(401, 'Refresh token expired');
  }

  // Revoke old token
  await RefreshToken.deleteOne({ _id: stored._id });

  // Create new tokens
  const tokens = await createTokens(stored.userId);
  const ip = req.ip;
  const ua = req.get('user-agent') || '';
  await RefreshToken.create({
    userId: stored.userId,
    tokenHash: tokens.tokenHash,
    expiresAt: tokens.expiresAt,
    ipAddress: ip,
    userAgent: ua
  });

  // For mobile clients return refresh token in response
  if (req.headers['x-client-type'] === 'mobile') {
    return ApiResponse.success(res, { accessToken: tokens.accessToken, refreshToken: tokens.rawRefresh }, 'Refreshed');
  }

  // For web clients set cookies
  res.cookie('refreshToken', tokens.rawRefresh, cookieOptions);
  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  return ApiResponse.success(res, { accessToken: tokens.accessToken, refreshToken: tokens.rawRefresh }, 'Refreshed');
});

/**
 * @desc Verify a user's email address
 * @route GET /api/auth/verify-email
 * @access Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.query.token?.toString();
  if (!token) return ApiResponse.error(res, 'Verification token is required', 400, 'Invalid verification token');

  const tokenHash = hashToken(token);
  const stored = await VerificationToken.findOne({ tokenHash });
  if (!stored) return ApiResponse.error(res, 'Invalid or expired verification token', 400, 'Invalid verification token');
  if (stored.expiresAt < new Date()) {
    await VerificationToken.deleteOne({ _id: stored._id });
    return ApiResponse.error(res, 'Verification token expired', 400, 'Invalid verification token');
  }

  const user = await User.findById(stored.userId);
  if (!user) return ApiResponse.error(res, 'Invalid verification token', 400, 'Invalid verification token');
  if (!user.isVerified) {
    user.isVerified = true;
    await user.save();
  }

  await VerificationToken.deleteOne({ _id: stored._id });

  const nextUrl = req.query.next?.toString();
  if (nextUrl) {
    return res.redirect(nextUrl);
  }

  return ApiResponse.success(res, { verified: true }, 'Email verified successfully');
});

/**
 * @desc Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Private
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const email = req.user?.email || req.body?.email;
  if (!email) throw new ApiError(400, 'Email is required');

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User not found');
  if (user.isVerified) throw new ApiError(400, 'Email already verified');

  // Delete any existing tokens for this user
  await VerificationToken.deleteMany({ userId: user._id });

  // Generate email verification token
  const verificationTokenRaw = generateRandomToken();
  const verificationTokenHash = hashToken(verificationTokenRaw);
  const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  await VerificationToken.create({
    userId: user._id,
    tokenHash: verificationTokenHash,
    expiresAt: verificationExpires
  });

  const verificationUrl = `${env.backendUrl}/api/auth/verify-email?token=${verificationTokenRaw}&next=${encodeURIComponent(
    `${env.clientUrl}/auth/verified`
  )}`;

  await sendMail({
    to: user.email,
    subject: 'Confirm your BoyzTrade email',
    html: `
      <p>Hi ${user.fullName},</p>
      <p>Please confirm your email by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify my email</a></p>
      <p>If the link does not work, copy and paste the following URL into your browser:</p>
      <p>${verificationUrl}</p>
      <p>Thank you for using BoyzTrade!</p>
    `
  });

  return ApiResponse.success(res, null, 'Verification email resent successfully');
});

/**
 * @desc Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal user existence
    return ApiResponse.success(res, { token: null }, 'If email exists, password reset token sent');
  }

  // Generate password reset token
  const raw = generateRandomToken();
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  // Store token hash in RefreshToken collection
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
    userAgent: 'password-reset'
  });

  // In production, send token via email. Here we return it for testing.
  return ApiResponse.success(res, { token: raw }, 'Password reset token created');
});

/**
 * @desc Reset password
 * @route POST /api/auth/reset-password
 * @access Public
 * @props {string} token - Password reset token
 * @props {string} password - New password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Find password reset token
  const tokenHash = hashToken(token);
  const stored = await RefreshToken.findOne({ tokenHash, userAgent: 'password-reset' });

  if (!stored || stored.expiresAt < new Date()) {
    return ApiResponse.error(res, 'Invalid or expired token', 400, 'Invalid token');
  }

  // Find user and update password
  const user = await User.findById(stored.userId);
  if (!user) {
    return ApiResponse.error(res, 'Invalid token', 400, 'Invalid token');
  }

  user.password = password;
  await user.save();

  // Delete used token
  await RefreshToken.deleteOne({ _id: stored._id });

  return ApiResponse.success(res, null, 'Password reset successfully');
});

/**
 * @desc Get current user
 * @route GET /api/auth/me
 * @access Private
 */
export const me = asyncHandler(async (req, res) => {
  // req.user is set by auth middleware
  const user = await User.findById(req.user._id).select('-password -passwordHash');
  return ApiResponse.success(res, { user }, 'Current user');
});

/**
 * @desc Update user profile (fullName)
 * @route PATCH /api/auth/profile
 * @access Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName } = req.body;
  const update = {};
  if (fullName) update.fullName = fullName;

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password -passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  return ApiResponse.success(res, { user }, 'Profile updated');
});

/**
 * @desc Change password while logged in
 * @route PATCH /api/auth/password
 * @access Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) throw new ApiError(400, 'Current password is incorrect');

  user.password = newPassword;
  await user.save();

  return ApiResponse.success(res, null, 'Password changed successfully');
});

/**
 * @desc Update user settings (notification preferences, etc.)
 * @route PATCH /api/auth/settings
 * @access Private
 */
export const updateSettings = asyncHandler(async (req, res) => {
  const { notificationPreferences } = req.body;
  const update = {};
  if (notificationPreferences) update.notificationPreferences = notificationPreferences;

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password -passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  return ApiResponse.success(res, { user }, 'Settings updated');
});

export default { register, login, logout, refresh, verifyEmail, resendVerification, forgotPassword, resetPassword, me, updateProfile, changePassword, updateSettings };
