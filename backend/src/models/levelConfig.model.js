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

export default LevelConfig;
