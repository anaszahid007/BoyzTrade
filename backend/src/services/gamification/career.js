import UserGamification from '../../models/userGamification.model.js';
import { emitGamificationUpdate } from './profile.js';

const CAREER_STAGES = [
  { stage: 0, title: 'Trader Intern', salary: 0, minTrades: 0, minLevel: 1 },
  { stage: 1, title: 'Junior Trader', salary: 30000, minTrades: 10, minLevel: 1 },
  { stage: 2, title: 'Associate Trader', salary: 55000, minTrades: 50, minLevel: 2 },
  { stage: 3, title: 'Trader', salary: 80000, minTrades: 100, minLevel: 3 },
  { stage: 4, title: 'Senior Trader', salary: 120000, minTrades: 250, minLevel: 4 },
  { stage: 5, title: 'Market Analyst', salary: 170000, minTrades: 500, minLevel: 5 },
  { stage: 6, title: 'Fund Manager', salary: 250000, minTrades: 1000, minLevel: 6, minStreak: 7 },
  { stage: 7, title: 'Trading Director', salary: 400000, minTrades: 2500, minLevel: 7, minStreak: 14 },
  { stage: 8, title: 'VP of Trading', salary: 750000, minTrades: 5000, minLevel: 8, minStreak: 30 },
  { stage: 9, title: 'Chief Investment Officer', salary: 1200000, minTrades: 10000, minLevel: 10 },
];

export const getCareerStages = () => CAREER_STAGES.map(s => ({ ...s }));

export const evaluateCareer = async (userId, profile) => {
  if (!profile) profile = await UserGamification.findOrCreate(userId);

  let newStage = profile.careerStage;
  for (let i = profile.careerStage + 1; i < CAREER_STAGES.length; i++) {
    const stage = CAREER_STAGES[i];
    const meetsTrades = profile.totalTrades >= stage.minTrades;
    const meetsLevel = profile.level >= stage.minLevel;
    const meetsStreak = stage.minStreak ? profile.currentStreak >= stage.minStreak : true;
    if (meetsTrades && meetsLevel && meetsStreak) {
      newStage = i;
    } else {
      break;
    }
  }

  if (newStage !== profile.careerStage) {
    profile.careerStage = newStage;
    profile.careerTitle = CAREER_STAGES[newStage].title;
    profile.virtualSalary = CAREER_STAGES[newStage].salary;
    await profile.save();
    emitGamificationUpdate(userId);
  }

  return profile;
};

export const getCareerPath = async (userId) => {
  const profile = await UserGamification.findOrCreate(userId);
  const stages = CAREER_STAGES.map((s, i) => {
    const meetsTrades = profile.totalTrades >= s.minTrades;
    const meetsLevel = profile.level >= s.minLevel;
    const meetsStreak = s.minStreak ? profile.currentStreak >= s.minStreak : true;
    const unlocked = meetsTrades && meetsLevel && meetsStreak;
    return {
      stage: s.stage,
      title: s.title,
      salary: s.salary,
      requirements: {
        trades: s.minTrades,
        level: s.minLevel,
        streak: s.minStreak || null,
      },
      unlocked,
      current: i === profile.careerStage,
      progress: i === profile.careerStage + 1
        ? {
            trades: Math.min(100, (profile.totalTrades / s.minTrades) * 100),
            level: Math.min(100, (profile.level / s.minLevel) * 100),
            streak: s.minStreak ? Math.min(100, (profile.currentStreak / s.minStreak) * 100) : 100,
          }
        : null,
    };
  });

  const nextStage = stages.find(s => !s.unlocked && s.stage > profile.careerStage);

  return {
    currentStage: profile.careerStage,
    currentTitle: profile.careerTitle,
    currentSalary: profile.virtualSalary,
    stages,
    nextStage: nextStage || null,
  };
};
