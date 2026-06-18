import jwtUtils from '../utils/jwt.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import User from '../models/user.model.js';
import { streakMiddleware } from './streak.middleware.js';

/**
 * Express middleware to protect routes using access token
 */
export async function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.accessToken;

        if (!accessToken) throw new ErrorResponse(401, 'Unauthorized');
        const payload = jwtUtils.verifyAccessToken(accessToken);
        const user = await User.findById(payload.sub).select('-passwordHash');
        if (!user) throw new ErrorResponse(401, 'Unauthorized');
        req.user = user;
        streakMiddleware(req, res, next);
    } catch (err) {
        next(err.name === 'JsonWebTokenError' ? new ErrorResponse(401, 'Invalid token') : err);
    }
};

/**
 * Express middleware to restrict access to specific roles
 */
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ErrorResponse(401, 'Unauthorized'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(403, 'Forbidden: Insufficient permissions'));
        }
        next();
    };
}

