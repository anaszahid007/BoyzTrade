import Response from '../utils/Response.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  getProfile,
  getLeaderboard,
  getUserBadges,
  getAllBadgesWithStatus,
  getUserQuests,
  claimQuest,
} from '../services/gamification.service.js';
import LevelConfig from '../models/levelConfig.model.js';

export const profile = asyncHandler(async (req, res) => {
  const data = await getProfile(req.user._id);
  return Response.success(res, data, 'Gamification profile retrieved');
});

export const levels = asyncHandler(async (req, res) => {
  const configs = await LevelConfig.find().sort({ level: 1 });
  return Response.success(res, configs, 'Level configs retrieved');
});

export const leaderboard = asyncHandler(async (req, res) => {
  const type = req.query.type || 'xp';
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const data = await getLeaderboard(type, limit);
  return Response.success(res, data, 'Leaderboard retrieved');
});

export const badges = asyncHandler(async (req, res) => {
  const data = await getAllBadgesWithStatus(req.user._id);
  return Response.success(res, data, 'Badges retrieved');
});

export const earnedBadges = asyncHandler(async (req, res) => {
  const data = await getUserBadges(req.user._id);
  return Response.success(res, data, 'Earned badges retrieved');
});

export const quests = asyncHandler(async (req, res) => {
  const data = await getUserQuests(req.user._id);
  return Response.success(res, data, 'Quests retrieved');
});

export const claimQuestReward = asyncHandler(async (req, res) => {
  const { userQuestId } = req.params;
  const data = await claimQuest(req.user._id, userQuestId);
  return Response.success(res, data, 'Quest reward claimed');
});
