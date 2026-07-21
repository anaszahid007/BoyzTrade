import mongoose from "mongoose";
import env from '../config/env.js';


let isConnected = false;
const connectDb = async () => {
    if (isConnected) {
        return;
    }

    try {
        const db = await mongoose.connect(env.mongoUri, { autoIndex: true });
        console.log('MongoDB connected successfully');
        isConnected = db.connections[0].readyState;
        
        // // Seed level configs
        // await seedLevelConfigs();
        // // Seed badges and quests
        // await seedBadges();
        // await seedQuests();

    } catch (err) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectDb;