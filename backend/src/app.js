import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

// Middleware
import errorHandler from './middleware/error.middleware.js';

// Routes
import assetRoutes from './routes/asset.routes.js';
import tradeRoutes from './routes/trade.routes.js';
import authRoutes from './routes/auth.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import watchlistRoutes from './routes/watchlist.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());


app.use('/api/auth', authRoutes);
app.use('/api/assets',assetRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/health', (req, res) => res.status(200).json({ success: true, message: 'Service is running' }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Not Found' }));


app.use(errorHandler);

export default app;
