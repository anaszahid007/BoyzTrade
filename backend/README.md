# Paper Trading Backend - Authentication System

A production-ready authentication system built with Node.js, Express, and MongoDB.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (copy from `.env.example`):
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/paper-trading
JWT_ACCESS_SECRET=your_strong_secret_here
JWT_REFRESH_SECRET=your_different_secret_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
NODE_ENV=development
COOKIE_SECURE=false
COOKIE_DOMAIN=
```

**Important:** Change `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to strong random strings in production.

### 3. Start the Server
```bash
npm start          # production mode
npm run dev        # development with auto-reload
```

## Project Structure

```
src/
├── config/           # Configuration (now deprecated - use process.env directly)
├── controllers/      # Route handlers
├── middleware/       # Express middleware (auth, validation, error handling, rate limiting)
├── models/           # MongoDB schemas (User, RefreshToken)
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Helper functions (jwt, hash, crypto, errors, responses)
└── validators/       # Input validation (Zod)
server.js            # Server entry point
app.js               # Express app setup
```

## Authentication Flow

### Register / Login
- **POST /api/auth/register** - Create new account
- **POST /api/auth/login** - Authenticate user

**Web Client:** Refresh token stored in secure httpOnly cookie
**Mobile Client:** Include header `x-client-type: mobile` to receive refresh token in response body

### Token Refresh
- **POST /api/auth/refresh** - Get new access token using refresh token

### Protected Routes
- **GET /api/auth/me** - Get current user (requires valid access token)
- Include header: `Authorization: Bearer <accessToken>`

### Password Reset
- **POST /api/auth/forgot-password** - Request password reset
- **POST /api/auth/reset-password** - Reset with token

### Logout
- **POST /api/auth/logout** - Invalidate refresh token

## Key Features

✅ **Argon2 Password Hashing** - Industry-standard password security
✅ **JWT Token Rotation** - Old refresh tokens are revoked on new issuance
✅ **Rate Limiting** - Protection against brute force attacks
✅ **Input Validation** - Zod validation on all endpoints
✅ **Error Handling** - Centralized error middleware
✅ **Security Headers** - Helmet.js for HTTP header security
✅ **CORS** - Cross-origin requests properly configured
✅ **Cookie Security** - httpOnly, Secure, SameSite flags

## How Code is Organized

### Controllers (`src/controllers/auth.controller.js`)
- Contains all business logic and request handling
- Directly interacts with models for data operations
- Handles token creation, validation, and user authentication
- Manages cookie setup for web clients and response formatting for mobile clients

### Models (`src/models/`)
- **User:** email, fullName, passwordHash, isEmailVerified
  - Pre-save hook hashes password with Argon2
  - comparePassword method for verification
- **RefreshToken:** userId, tokenHash, expiresAt, userAgent, ipAddress
  - Stores hashed refresh tokens (never raw tokens)
  - TTL index for automatic cleanup

### Middleware (`src/middleware/`)
- **auth.middleware.js** - Validates JWT access token
- **validate.middleware.js** - Validates request body with Zod schema
- **rateLimiter.js** - Rate limit on auth routes
- **error.middleware.js** - Handles all errors with proper status codes

### Utils (`src/utils/`)
- **jwt.js** - Sign/verify access and refresh tokens
- **hash.js** - Argon2 password hashing
- **crypto.js** - Generate random tokens and hash them (SHA-256)
- **asyncHandler.js** - Wraps async route handlers for error catching
- **ApiError.js** - Custom error class
- **ApiResponse.js** - Consistent response format

## Testing Endpoints

### Register (Web)
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "fullName": "John Doe",
    "password": "securepassword123"
  }'
```

### Register (Mobile)
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-client-type: mobile" \
  -d '{
    "email": "user@example.com",
    "fullName": "John Doe",
    "password": "securepassword123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Environment Variables Explained

| Variable | Default | Purpose |
|----------|---------|---------|
| PORT | 4000 | Server port |
| MONGO_URI | localhost | MongoDB connection string |
| JWT_ACCESS_SECRET | change-me | Secret for signing access tokens |
| JWT_REFRESH_SECRET | change-me | Secret for signing refresh tokens |
| JWT_ACCESS_EXPIRES | 15m | Access token expiration time |
| JWT_REFRESH_EXPIRES | 30d | Refresh token expiration time |
| NODE_ENV | development | Development or production |
| COOKIE_SECURE | false | Enable secure cookies in production |
| COOKIE_DOMAIN | - | Domain for cookies (optional) |

## Security Notes

🔒 **Never commit `.env` file to git** - Use `.env.example` as template
🔒 **Use strong JWT secrets** - Minimum 32 characters, random strings
🔒 **Enable HTTPS in production** - Set `COOKIE_SECURE=true`
🔒 **Refresh tokens are hashed** - Raw tokens never stored in database
🔒 **Token rotation enabled** - Old tokens revoked when new ones issued
🔒 **Rate limiting active** - 100 requests per 15 minutes on auth routes

## Next Steps

1. Connect to a real MongoDB instance
2. Add email verification via Nodemailer
3. Add Redis for token blacklist / session management
4. Implement refresh token storage by device/client
5. Add OAuth2 (Google, GitHub, etc.)
6. Add 2FA / MFA support
7. Add user profile endpoints
8. Add role-based access control (RBAC)
