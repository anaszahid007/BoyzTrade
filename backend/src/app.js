import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

// Database connection
import connectDb from './config/db.js';

// Middleware
import errorHandler from './middleware/error.middleware.js';

// Routes
import assetRoutes from './routes/asset.routes.js';
import tradeRoutes from './routes/trade.routes.js';
import authRoutes from './routes/auth.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import watchlistRoutes from './routes/watchlist.routes.js';
import adminRoutes from './routes/admin.routes.js';
import gamificationRoutes from './routes/gamification.routes.js';
import learningRoutes from './routes/learning.routes.js';
import uploadRoutes from './routes/upload.routes.js';

// Config
import env from './config/env.js';


const app = express();

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).send('Database connection error');
  }
});

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://s3.tradingview.com"],
      imgSrc: ["'self'", "data:", "https://assets.coingecko.com", "https://coin-images.coingecko.com", "https://res.cloudinary.com"],
      connectSrc: ["'self'", env.clientUrl],
      mediaSrc: ["'self'", "https://res.cloudinary.com"],
      frameSrc: ["'self'", "https://s3.tradingview.com"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
}));

app.use(cors({ 
	origin: env.clientUrl,
	credentials: true 
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());


app.use('/api/auth', authRoutes);
app.use('/api/assets',assetRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/health', (req, res) => res.status(200).json({ success: true, message: 'Service is running' }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Not Found' }));


app.use(errorHandler);

export default app;
