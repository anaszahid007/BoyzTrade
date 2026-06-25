import rateLimit from 'express-rate-limit';

const message = { success: false, message: 'Too many requests, please try again after 15 minutes' };

const keyGenerator = (req) => {
  const ua = req.headers['user-agent'] || 'unknown';
  return `${req.ip}:${ua}`;
};

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message,
    keyGenerator,
    skipSuccessfulRequests: true,
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message,
    keyGenerator,
});

export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message,
    keyGenerator,
});

