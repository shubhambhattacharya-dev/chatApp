import { Server } from "socket.io"; // ✅ correct import
import http from "http";
import logger from "./logger.js";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Track online users
const userSocketMap = {}; // { userId: socketId }

// ✅ Listen for incoming connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  const userId = socket.handshake.query.userId;

  logger.info(
    `User connected: ${socket.id}, userId: ${userId || "unknown"}`
  );

  // ✅ Mark user as online
  if (userId) userSocketMap[userId] = socket.id;

  // ✅ Emit updated online users list to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); 

  // ✅ Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    logger.info(`User disconnected: ${socket.id}`);

    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap)); 
    }
  });
});

export { io, server, app };
