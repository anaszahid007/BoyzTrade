import jwtUtils from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.model.js';

/**
 * Express middleware to protect routes using access token
 */
export async function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.accessToken;

        if (!accessToken) throw new ApiError(401, 'Unauthorized');
        const payload = jwtUtils.verifyAccessToken(accessToken);
        const user = await User.findById(payload.sub).select('-passwordHash');
        if (!user) throw new ApiError(401, 'Unauthorized');
        req.user = user;
        next();
    } catch (err) {
        next(err.name === 'JsonWebTokenError' ? new ApiError(401, 'Invalid token') : err);
    }
};

/**
 * Express middleware to restrict access to specific roles
 */
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, 'Unauthorized'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, 'Forbidden: Insufficient permissions'));
        }
        next();
    };
}

