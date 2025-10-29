import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import connectDB from "./db/connectMongoDB.js";
import logger from "./lib/util/logger.js";
import { initSocket } from "./lib/util/socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 8000;

// Validate essential environment variables on startup
const requiredEnv = ['MONGO_DB', 'JWT_SECRET'];
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    logger.fatal(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"], // Your frontend URLs
  credentials: true,
}));
app.use(express.json({ limit: "5mb" })); // To parse JSON payloads
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Error Handling Middleware
// 1. 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// 2. Global Error Handler
app.use((err, req, res, next) => {
  logger.error({ err, req }, "🔥 An unexpected error occurred");
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.fatal({ err: error }, "💥 Failed to start server");
    process.exit(1);
  }
};

startServer();