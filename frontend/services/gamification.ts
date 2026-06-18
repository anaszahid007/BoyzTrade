import apiFetch from "@/utils/api";

export interface GamificationProfile {
  xp: number;
  level: number;
  levelTitle: string;
  xpForNext: number;
  xpForCurrent: number;
  currentStreak: number;
  longestStreak: number;
  totalTrades: number;
  profitableTrades: number;
  stopLossUsed: number;
  lessonsCompleted: number;
  challengesCompleted: number;
  careerStage: number;
  careerTitle: string;
  virtualSalary: number;
  unlockedFeatures: string[];
}

export interface LevelConfig {
  level: number;
  title: string;
  xpRequired: number;
  rewards: { features: string[] };
}

export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xpReward: number;
  requirement?: { type: string; value: number };
  earned: boolean;
  earnedAt?: string;
}

export interface Quest {
  _id: string;
  questId: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  xpReward: number;
  requirement: { type: string; value: number };
  progress: number;
  completed: boolean;
  completedAt?: string;
  claimed: boolean;
  claimedAt?: string;
  periodStart?: string;
  periodEnd?: string;
}

export const gamificationService = {
  async getProfile(): Promise<GamificationProfile> {
    const res = await apiFetch<GamificationProfile>("/api/gamification/profile", { method: "GET" });
    return res.data;
  },

  async getLevels(): Promise<LevelConfig[]> {
    const res = await apiFetch<LevelConfig[]>("/api/gamification/levels", { method: "GET" });
    return res.data;
  },

  async getLeaderboard(type = "xp", limit = 20): Promise<any[]> {
    const res = await apiFetch<any[]>(`/api/gamification/leaderboard?type=${type}&limit=${limit}`, { method: "GET" });
    return res.data;
  },

  async getBadges(): Promise<Badge[]> {
    const res = await apiFetch<Badge[]>("/api/gamification/badges", { method: "GET" });
    return res.data;
  },

  async getEarnedBadges(): Promise<Badge[]> {
    const res = await apiFetch<Badge[]>("/api/gamification/badges/earned", { method: "GET" });
    return res.data;
  },

  async getQuests(): Promise<Quest[]> {
    const res = await apiFetch<Quest[]>("/api/gamification/quests", { method: "GET" });
    return res.data;
  },

  async claimQuest(userQuestId: string): Promise<any> {
    const res = await apiFetch<any>(`/api/gamification/quests/${userQuestId}/claim`, { method: "POST" });
    return res.data;
  },
};
