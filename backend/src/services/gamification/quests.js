import Quest from '../../models/quest.model.js';
import UserQuest from '../../models/userQuest.model.js';
import { emitToUser } from '../../socket.js';
import { awardXP } from './profile.js';
import ErrorResponse from '../../utils/ErrorResponse.js';

/** Creates UserQuest entries for all active daily/weekly quests if they don't already exist for the current period. */
export const initializeQuests = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const activeQuests = await Quest.find({ isActive: true });

    for (const quest of activeQuests) {
      let periodStart = null;
      let periodEnd = null;

      if (quest.type === 'daily') {
        periodStart = new Date(today);
        periodEnd = new Date(today);
        periodEnd.setDate(periodEnd.getDate() + 1);
      } else if (quest.type === 'weekly') {
        periodStart = new Date(weekStart);
        periodEnd = new Date(weekStart);
        periodEnd.setDate(periodEnd.getDate() + 7);
      }

      const existing = await UserQuest.findOne({
        userId,
        questId: quest._id,
        periodStart,
      });

      if (!existing) {
        await UserQuest.create({
          userId,
          questId: quest._id,
          progress: 0,
          completed: false,
          claimed: false,
          periodStart,
          periodEnd,
        });
      }
    }
  } catch {
    // silent
  }
};

/** Increments progress for all matching active quests and emits quest-completed events when thresholds are met. */
export const updateQuestProgress = async (userId, type, increment = 1) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const matchingQuests = await Quest.find({
      isActive: true,
      'requirement.type': type,
    });

    for (const quest of matchingQuests) {
      let periodStart;
      if (quest.type === 'daily') {
        periodStart = today;
      } else if (quest.type === 'weekly') {
        periodStart = weekStart;
      } else {
        periodStart = null;
      }

      let userQuest;
      if (periodStart) {
        userQuest = await UserQuest.findOne({
          userId,
          questId: quest._id,
          periodStart,
        });
      } else {
        userQuest = await UserQuest.findOne({
          userId,
          questId: quest._id,
        });
      }

      if (!userQuest || userQuest.completed) continue;

      userQuest.progress += Math.round(increment * 100) / 100;

      if (userQuest.progress >= quest.requirement.value) {
        userQuest.progress = quest.requirement.value;
        userQuest.completed = true;
        userQuest.completedAt = new Date();
      }

      await userQuest.save();

      if (userQuest.completed) {
        emitToUser(userId, 'quest-completed', {
          _id: userQuest._id,
          questId: quest._id,
          name: quest.name,
          description: quest.description,
          icon: quest.icon,
          xpReward: quest.xpReward,
        });
      }

      emitQuestUpdate(userId);
    }
  } catch {
    // silent
  }
};

/** Marks a completed quest as claimed and awards the XP reward to the user. */
export const claimQuest = async (userId, userQuestId) => {
  const userQuest = await UserQuest.findOne({ _id: userQuestId, userId }).populate('questId');
  if (!userQuest) throw new ErrorResponse(404, 'Quest not found');
  if (!userQuest.completed) throw new ErrorResponse(400, 'Quest not completed');
  if (userQuest.claimed) throw new ErrorResponse(400, 'Quest already claimed');

  userQuest.claimed = true;
  userQuest.claimedAt = new Date();
  await userQuest.save();

  if (userQuest.questId.xpReward > 0) {
    await awardXP(userId, userQuest.questId.xpReward, `quest_${userQuest.questId.name}`);
  }

  emitQuestUpdate(userId);
  return userQuest;
};

/** Returns all quests for the user (active and completed) with populated quest details. */
export const getUserQuests = async (userId) => {
  const userQuests = await UserQuest.find({ userId })
    .populate({ path: 'questId' })
    .sort({ createdAt: -1 })
    .lean();

  return userQuests
    .filter(uq => uq.questId)
    .map(uq => ({
      _id: uq._id,
      questId: uq.questId._id,
      name: uq.questId.name,
      description: uq.questId.description,
      icon: uq.questId.icon,
      type: uq.questId.type,
      xpReward: uq.questId.xpReward,
      requirement: uq.questId.requirement,
      progress: uq.progress,
      completed: uq.completed,
      completedAt: uq.completedAt,
      claimed: uq.claimed,
      claimedAt: uq.claimedAt,
      periodStart: uq.periodStart,
      periodEnd: uq.periodEnd,
    }));
};

const emitQuestUpdate = async (userId) => {
  try {
    const data = await getUserQuests(userId);
    emitToUser(userId, 'quests-update', data);
  } catch {
    // silent
  }
};
