import mongoose from 'mongoose';
import env from './config/env.js';
import User from './models/user.model.js';

const ADMIN_EMAIL = 'admin@boyztrade.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin';

const seed = async () => {
  try {
    await mongoose.connect(env.mongoUri, { autoIndex: true });
    console.log('MongoDB connected');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin already exists (${ADMIN_EMAIL}), skipping seed.`);
      process.exit(0);
    }

    await User.create({
      email: ADMIN_EMAIL,
      fullName: ADMIN_NAME,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
    });

    console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
