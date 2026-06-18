import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const LevelConfigSchema = new Schema({
  level: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  xpRequired: { type: Number, required: true },
  rewards: {
    features: { type: [String], default: [] },
  },
});

const LevelConfig = model('LevelConfig', LevelConfigSchema);

const defaultLevels = [
  { level: 1, title: 'Beginner', xpRequired: 0, rewards: { features: [] } },
  { level: 2, title: 'Rookie Trader', xpRequired: 100, rewards: { features: [] } },
  { level: 3, title: 'Market Explorer', xpRequired: 300, rewards: { features: [] } },
  { level: 4, title: 'Analyst', xpRequired: 700, rewards: { features: [] } },
  { level: 5, title: 'Swing Trader', xpRequired: 1500, rewards: { features: [] } },
  { level: 6, title: 'Pro Trader', xpRequired: 3000, rewards: { features: [] } },
];

export async function seedLevelConfigs() {
  const count = await LevelConfig.countDocuments();
  if (count > 0) return;
  await LevelConfig.insertMany(defaultLevels);
  console.log('[Seed] Level configs inserted');
}

export default LevelConfig;
