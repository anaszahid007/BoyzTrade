import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import jwtUtils from '../utils/jwt.js';
import { generateRandomToken, hashToken } from '../utils/crypto.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined,
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
  const exp = process.env.JWT_REFRESH_EXPIRES || '30d';
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
 * Register controller
 */
export const register = asyncHandler(async (req, res) => {
  const { email, fullName, password } = req.body;

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, 'Email already exists');

  // Create new user
  const user = new User({ email, fullName, password });
  await user.save();

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

  // For mobile clients return refresh token in response
  if (req.headers['x-client-type'] === 'mobile') {
    return ApiResponse.success(res, { user: userObj, accessToken: tokens.accessToken, refreshToken: tokens.rawRefresh }, 'Registered', 201);
  }

  // For web clients set cookies
  res.cookie('refreshToken', tokens.rawRefresh, cookieOptions);
  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  return ApiResponse.success(res, { user: userObj, accessToken: tokens.accessToken, refreshToken: tokens.rawRefresh }, 'Registered', 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and get password hash
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');

  // Compare password
  const isValid = await user.comparePassword(password);
  if (!isValid) throw new ApiError(401, 'Invalid credentials');

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

export const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!raw) throw new ApiError(401, 'No refresh token');

  // Verify refresh token exists and is not expired
  const tokenHash = hashToken(raw);
  const stored = await RefreshToken.findOne({ tokenHash });
  if (!stored) throw new ApiError(401, 'Invalid refresh token');
  if (stored.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: stored._id });
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
 * Reset password controller
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Find password reset token
  const tokenHash = hashToken(token);
  const stored = await RefreshToken.findOne({ tokenHash, userAgent: 'password-reset' });

  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(400, 'Invalid or expired token');
  }

  // Find user and update password
  const user = await User.findById(stored.userId);
  if (!user) throw new ApiError(400, 'Invalid token');

  user.password = password;
  await user.save();

  // Delete used token
  await RefreshToken.deleteOne({ _id: stored._id });

  return ApiResponse.success(res, null, 'Password reset successfully');
});

export const me = asyncHandler(async (req, res) => {
  // req.user is set by auth middleware
  const user = await User.findById(req.user._id).select('-password -passwordHash');
  return ApiResponse.success(res, { user }, 'Current user');
});

export default { register, login, logout, refresh, forgotPassword, resetPassword, me };
