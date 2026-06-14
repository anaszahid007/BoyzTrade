import mongoose from 'mongoose';
import { createServer } from 'http';
import app from './src/app.js';
import env from './src/config/env.js';
import { initSocket } from './src/socket.js';
import { startPriceBroadcast } from './src/services/broadcast.service.js';

const PORT = env.port;
const MONGO_URI = env.mongoUri;

const httpServer = createServer(app);
initSocket(httpServer);

const start = async () => {
	try {
		await mongoose.connect(MONGO_URI, { autoIndex: true });
		console.log('MongoDB connected');
		
		// Start real-time broadcasting
		startPriceBroadcast();
		
		httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}\nhttp://localhost:${PORT}`));
	} catch (err) {
		console.error('Failed to start server', err);
		process.exit(1);
	}
};

start();
