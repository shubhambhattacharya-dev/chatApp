import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import logger from "./logger.js";

export let io: Server;

// Map to store userId -> [socketId1, socketId2, ...]
const userSocketMap: Record<string, string[]> = {};

export const getAllUserSockets = (userId: string): string[] => {
  return userSocketMap[userId] || [];
};

export const initSocket = (server: HttpServer | HttpsServer) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust this based on your config if needed
    },
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      if (!userSocketMap[userId]) {
        userSocketMap[userId] = [];
      }
      userSocketMap[userId].push(socket.id);
      logger.info(`User ${userId} connected with socket ${socket.id}`);
      
      // Broadcast online status
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    socket.on("disconnect", () => {
      if (userId && userSocketMap[userId]) {
        userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
        if (userSocketMap[userId].length === 0) {
          delete userSocketMap[userId];
        }
        logger.info(`User ${userId} disconnected from socket ${socket.id}`);
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });
  });
};
