import dotenv from 'dotenv';

dotenv.config();

const {
    NODE_ENV,
    PORT,
    MONGO_URI,
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES,
    JWT_REFRESH_EXPIRES,
    COOKIE_SECURE,
    COOKIE_DOMAIN,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASS,
    BACKEND_URL,
    CLIENT_URL,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_URL,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
} = process.env;

const isProd = NODE_ENV === 'production';

export default {

    port: Number(PORT) || 4000,
    mongoUri: MONGO_URI || 'mongodb://localhost:27017/paper-trading',

    mail: {
        host: EMAIL_HOST || 'smtp.gmail.com',
        port: Number(EMAIL_PORT) || 587,
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },

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
        sameSite: isProd ? 'lax' : 'lax',
        domain: COOKIE_DOMAIN || undefined
    },

    redis: {
        host: REDIS_HOST || 'localhost',
        port: Number(REDIS_PORT) || 6379,
        url: REDIS_URL || `redis://${REDIS_HOST || 'localhost'}:${REDIS_PORT || 6379}`
    },

    cloudinary: {
        cloudName: CLOUDINARY_CLOUD_NAME,
        apiKey: CLOUDINARY_API_KEY,
        apiSecret: CLOUDINARY_API_SECRET,
    },

    isProd,
    backendUrl: BACKEND_URL || 'http://localhost:5000',
    clientUrl: CLIENT_URL || 'http://localhost:3000'
};
