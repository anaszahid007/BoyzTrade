import dotenv from 'dotenv';

dotenv.config();

const {
    PORT = 4000,
    MONGO_URI = 'mongodb://localhost:27017/paper-trading',
    JWT_ACCESS_SECRET = 'change-me-access',
    JWT_REFRESH_SECRET = 'change-me-refresh',
    JWT_ACCESS_EXPIRES = '15m',
    JWT_REFRESH_EXPIRES = '30d',
    NODE_ENV = 'development',
    COOKIE_SECURE = 'true',
    COOKIE_DOMAIN = ''
} = process.env;

const isProd = NODE_ENV === 'production';

export default {

    port: Number(PORT),
    mongoUri: MONGO_URI,

    jwt: {
        access: {
            secret: JWT_ACCESS_SECRET,
            expiresIn: JWT_ACCESS_EXPIRES
        },
        refresh: {
            secret: JWT_REFRESH_SECRET,
            expiresIn: JWT_REFRESH_EXPIRES
        }
    },

    cookie: {
        secure: COOKIE_SECURE === 'true' && isProd,
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        domain: COOKIE_DOMAIN || undefined
    },
    
    isProd
};
