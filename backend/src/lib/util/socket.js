import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import logger from "./logger.js";
import cookieParser from "cookie-parser";

let io;

const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (userId) => userSocketMap[userId];

export const initSocket = (server) => {
	io = new Server(server, {
		cors: {
			origin: ["http://localhost:3000", "http://localhost:3001"],
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

		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
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
			userSocketMap[userId] = socket.id;
		}

		io.emit("getOnlineUsers", Object.keys(userSocketMap));

		socket.on("disconnect", () => {
			logger.info(`User disconnected: ${socket.id}, userId: ${userId}`);
			if (userId) {
				delete userSocketMap[userId];
				io.emit("getOnlineUsers", Object.keys(userSocketMap));
			}
		});
	});

	return io;
};

export { io };
