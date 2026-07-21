import User from '../models/user.model.js';
import Response from '../utils/Response.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -passwordHash');
  return Response.success(res, { user }, 'Current user');
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName } = req.body;
  const update = {};
  if (fullName) update.fullName = fullName;

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password -passwordHash');
  if (!user) throw new ErrorResponse(404, 'User not found');

  return Response.success(res, { user }, 'Profile updated');
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new ErrorResponse(404, 'User not found');

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) throw new ErrorResponse(400, 'Current password is incorrect');

  user.password = newPassword;
  await user.save();

  return Response.success(res, null, 'Password changed successfully');
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { notificationPreferences } = req.body;
  const update = {};
  if (notificationPreferences) update.notificationPreferences = notificationPreferences;

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password -passwordHash');
  if (!user) throw new ErrorResponse(404, 'User not found');

  return Response.success(res, { user }, 'Settings updated');
});

export const submitSurvey = asyncHandler(async (req, res) => {
  const { experienceLevel, referralSource, tradingGoals } = req.body;

  const update = {
    surveyCompleted: true,
    'onboardingSurvey.experienceLevel': experienceLevel || null,
    'onboardingSurvey.referralSource': referralSource || null,
    'onboardingSurvey.tradingGoals': tradingGoals || null,
  };

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password -passwordHash');
  if (!user) throw new ErrorResponse(404, 'User not found');

  return Response.success(res, { user }, 'Survey submitted');
});

export default { me, updateProfile, changePassword, updateSettings, submitSurvey };
