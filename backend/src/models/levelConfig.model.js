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
  { level: 1, title: 'Beginner', xpRequired: 0, rewards: { features: ['basic_trading'] } },
  { level: 2, title: 'Rookie Trader', xpRequired: 100, rewards: { features: ['advanced_charting'] } },
  { level: 3, title: 'Market Explorer', xpRequired: 300, rewards: { features: ['stop_loss'] } },
  { level: 4, title: 'Analyst', xpRequired: 700, rewards: { features: ['margin_trading'] } },
  { level: 5, title: 'Swing Trader', xpRequired: 1500, rewards: { features: ['limit_orders'] } },
  { level: 6, title: 'Pro Trader', xpRequired: 3000, rewards: { features: ['api_access'] } },
];

export async function seedLevelConfigs() {
  for (const lvl of defaultLevels) {
    await LevelConfig.findOneAndUpdate({ level: lvl.level }, lvl, { upsert: true, new: true });
  }
  console.log('[Seed] Level configs synced');
}

export default LevelConfig;
