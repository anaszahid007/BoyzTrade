import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './src/app.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/paper-trading';

const start = async () => {
	try {
		await mongoose.connect(MONGO_URI, { autoIndex: true });
		console.log('MongoDB connected');
		app.listen(PORT, () => console.log(`Server running on port ${PORT}\nhttp://localhost:${PORT}`));
	} catch (err) {
		console.error('Failed to start server', err);
		process.exit(1);
	}
};

start();
