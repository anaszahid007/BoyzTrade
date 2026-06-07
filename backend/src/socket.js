import { Server } from "socket.io";
import envs from "./config/envs.js";

let io;

export const initSocket = (server) => {
  // Support comma-separated list of allowed origins e.g. "http://localhost:3000,https://xxx.ngrok-free.dev"
  const allowedOrigins = envs.clientUrl
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin '${origin}' not allowed`));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-user-room", (userId) => {
      if (userId) {
        socket.join(`user-${userId}`);
        console.log(`Socket ${socket.id} joined room user-${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};

export const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};
