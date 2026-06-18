import Badge from '../../models/badge.model.js';
import Quest from '../../models/quest.model.js';

/** Creates a new badge from the provided data. */
export const createBadge = async (data) => {
  return Badge.create(data);
};

/** Updates an existing badge by ID. Throws if not found. */
export const updateBadge = async (badgeId, data) => {
  const badge = await Badge.findByIdAndUpdate(badgeId, data, { new: true });
  if (!badge) throw new Error('Badge not found');
  return badge;
};

/** Deletes a badge by ID. Throws if not found. */
export const deleteBadge = async (badgeId) => {
  const badge = await Badge.findByIdAndDelete(badgeId);
  if (!badge) throw new Error('Badge not found');
  return badge;
};

/** Returns all badges sorted by category and creation date. */
export const listBadges = async () => {
  return Badge.find().sort({ category: 1, createdAt: -1 }).lean();
};

/** Creates a new quest from the provided data. */
export const createQuest = async (data) => {
  return Quest.create(data);
};

/** Updates an existing quest by ID. Throws if not found. */
export const updateQuest = async (questId, data) => {
  const quest = await Quest.findByIdAndUpdate(questId, data, { new: true });
  if (!quest) throw new Error('Quest not found');
  return quest;
};

/** Deletes a quest by ID. Throws if not found. */
export const deleteQuest = async (questId) => {
  const quest = await Quest.findByIdAndDelete(questId);
  if (!quest) throw new Error('Quest not found');
  return quest;
};

/** Returns all quests sorted by type and creation date. */
export const listQuests = async () => {
  return Quest.find().sort({ type: 1, createdAt: -1 }).lean();
};
