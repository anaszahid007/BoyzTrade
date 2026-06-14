# 💹 Boyz Trade

**Boyz Trade** is a full-stack virtual trading simulator for crypto markets, built with a Next.js frontend and an Express/Mongo backend. The app includes realtime sockets, JWT auth, portfolio management, watchlists, and Redis for session/cache support.

## 🚀 What’s Included

- `frontend/` — Next.js 16 application using React 19
- `backend/` — Express API with MongoDB, Socket.IO, Redis, and JWT authentication
- `docker-compose.yml` — Start frontend, backend, MongoDB, and Redis in one command
- `backend/src/config/env.js` — centralized configuration for MongoDB, Redis, JWT, cookies, mail, and URLs

## 🛠 Tech Stack

- Frontend: Next.js 16, React 19, Tailwind CSS 4, Framer Motion
- Backend: Node.js, Express, Mongoose, Socket.IO, ioredis
- Database: MongoDB
- Cache / session store: Redis
- Auth: JWT access/refresh tokens with cookie support
- API: Native `fetch` in frontend, REST API in backend

## 📁 Root Project Structure

```text
├── backend/              # Express backend API + socket services
│   ├── src/              # backend source code
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/             # Next.js frontend application
│   ├── app/
│   ├── components/
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml    # Compose stack for backend, frontend, MongoDB, Redis
└── README.md             # Project overview and setup guide
```

## 🚀 Run with Docker

From the project root:

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

Stop the stack with:

```bash
docker compose down
```

## 🔧 Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🌐 Environment Variables

### Backend
Create `backend/.env` or set these variables in your environment:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/paper-trading
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
BACKEND_URL=http://localhost:4000
CLIENT_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
COOKIE_SECURE=false
COOKIE_DOMAIN=
```

### Frontend
Create `frontend/.env.local` or set this variable in your environment:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📌 Notes

- The backend now uses MongoDB and Redis.
- Docker Compose includes Redis and MongoDB for local development.
- Keep secret env values out of source control.

---

Built with 💚 by the Boyz Trade team.
