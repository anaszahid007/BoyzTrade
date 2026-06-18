import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  profile,
  levels,
  leaderboard,
  badges,
  earnedBadges,
  quests,
  claimQuestReward,
} from '../controllers/gamification.controller.js';

const router = Router();

router.get('/profile', protect, profile);
router.get('/levels', levels);
router.get('/leaderboard', protect, leaderboard);
router.get('/badges', protect, badges);
router.get('/badges/earned', protect, earnedBadges);
router.get('/quests', protect, quests);
router.post('/quests/:userQuestId/claim', protect, claimQuestReward);

export default router;
