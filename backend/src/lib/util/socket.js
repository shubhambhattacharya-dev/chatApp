import { Server } from "socket.io";
import http from "http";
import logger from "./logger.js";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean) || [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ✅ Track online users
export const userSocketMap = {}; // { userId: socketId }

// JWT authentication middleware for socket connections
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];

    if (!token) {
      logger.warn(`Socket connection rejected: no token provided from ${socket.id}`);
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      logger.warn(`Socket connection rejected: invalid token from ${socket.id}`);
      return next(new Error('Authentication error: Invalid token'));
    }

    socket.userId = decoded.userId;
    logger.info(`Socket authenticated: ${socket.id} -> userId: ${socket.userId}`);
    return next();
  } catch (error) {
    logger.error({ err: error }, `Socket authentication failed for ${socket.id}`);
    return next(new Error('Authentication error'));
  }
});

// ✅ Listen for incoming connections
io.on("connection", (socket) => {
  const userId = socket.userId;

  logger.info(`User connected: ${socket.id}, userId: ${userId}`);

  if (userId) {
    userSocketMap[userId] = socket.id;
    // Join user-specific room for private messaging
    socket.join(`user:${userId}`);
  }

  // ✅ Emit updated online users list to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle typing events with proper room scoping
  socket.on('typing_start', (data) => {
    if (data.receiverId && data.receiverId !== userId) {
      socket.to(`user:${data.receiverId}`).emit('userTyping', {
        senderId: userId,
        isTyping: true
      });
      logger.debug(`Typing start: ${userId} -> ${data.receiverId}`);
    }
  });

  socket.on('typing_stop', (data) => {
    if (data.receiverId && data.receiverId !== userId) {
      socket.to(`user:${data.receiverId}`).emit('userTyping', {
        senderId: userId,
        isTyping: false
      });
      logger.debug(`Typing stop: ${userId} -> ${data.receiverId}`);
    }
  });

  // ✅ Handle user disconnect
  socket.on("disconnect", async () => {
    logger.info(`User disconnected: ${socket.id}`);

    if (userId) {
      delete userSocketMap[userId];

      // Update user status in database
      try {
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      } catch (err) {
        logger.error("Error updating user offline status:", err);
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

  // Error handling
  socket.on("error", (error) => {
    logger.error("Socket error:", {
      error,
      socketId: socket.id,
      userId: socket.userId,
    });
  });
});

export { io, server, app };
