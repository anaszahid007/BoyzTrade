import mongoose from 'mongoose';
import { createServer } from 'http';
import app from './src/app.js';
import env from './src/config/env.js';
import { initSocket } from './src/socket.js';
import { startPriceBroadcast } from './src/services/broadcast.service.js';
import { seedLevelConfigs } from './src/models/levelConfig.model.js';
import { seedBadges } from './src/models/badge.model.js';
import { seedQuests } from './src/models/quest.model.js';
import connectDb from './src/config/db.js';

const PORT = env.port;

const httpServer = createServer(app);
initSocket(httpServer);

// Database connection
connectDb();

// Start real-time broadcasting
startPriceBroadcast();

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));