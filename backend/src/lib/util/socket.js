import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import logger from "./logger.js";
import cookieParser from "cookie-parser";

let io;

const userSocketMap = {}; // { userId: [socketId1, socketId2, ...] }


export const getAllUserSockets = (userId) => userSocketMap[userId] || [];

const initSocket = (server) => {
	io = new Server(server, {
		cors: {
			origin: process.env.SOCKET_CORS_ORIGIN
				? process.env.SOCKET_CORS_ORIGIN.split(',')
				: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
			credentials: true,
		},
	});

	// Use cookie-parser middleware for socket.io
	io.engine.use(cookieParser());

	io.use((socket, next) => {
		const token = socket.request.cookies.jwt;

		if (!token) {
			logger.warn("Socket Authentication error: No token provided.");
			return next(new Error("Authentication error: No token provided."));
		}

		jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
			if (err) {
				logger.error("Socket Authentication error: Invalid token.");
				return next(new Error("Authentication error: Invalid token."));
			}
			socket.user = decoded;
			next();
		});
	});

	io.on("connection", (socket) => {
		const userId = socket.user.userId;
		logger.info(`User connected: ${socket.id}, userId: ${userId}`);

		if (userId) {
			if (!userSocketMap[userId]) {
				userSocketMap[userId] = [];
			}
			userSocketMap[userId].push(socket.id);
		}

		io.emit("getOnlineUsers", Object.keys(userSocketMap));

		// Note: "sendMessage" event is handled in message.controller.js after saving to DB
		// This socket listener is redundant and can be removed if not used elsewhere

		socket.on("messageDeleted", ({ messageId, receiverId }) => {
			logger.info(`Message deleted event: ${messageId}, receiverId: ${receiverId}`);
			const recipientSockets = getAllUserSockets(receiverId);
			recipientSockets.forEach((socketId) => {
				io.to(socketId).emit("messageDeleted", messageId);
			});
		});

		socket.on("disconnect", () => {
			logger.info(`User disconnected: ${socket.id}, userId: ${userId}`);
			if (userId && userSocketMap[userId]) {
				userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
				if (userSocketMap[userId].length === 0) {
					delete userSocketMap[userId];
				}
				io.emit("getOnlineUsers", Object.keys(userSocketMap));
			}
		});
	});

	return io;
};

export { io };
