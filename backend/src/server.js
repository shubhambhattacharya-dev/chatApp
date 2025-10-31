import express from "express";
import http from "http";

import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import connectDB from "./db/connectMongoDB.js";
import logger from "./lib/util/logger.js";
import { initSocket } from "./lib/util/socket.js";

const app = express();
const server = http.createServer(app);
server.setMaxListeners(50); // Increase max listeners to prevent memory leak warnings
initSocket(server);

const PORT = process.env.PORT || 8000;

// Validate essential environment variables on startup
const requiredEnv = ['MONGO_DB', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'NODE_ENV'];
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    logger.fatal(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Apply security middleware
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
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
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? message : "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
    });

    // Handle port conflicts gracefully
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        if (process.env.NODE_ENV === 'development') {
          const nextPort = parseInt(PORT) + 1;
          logger.warn(`Port ${PORT} is busy, trying port ${nextPort}`);
          server.listen(nextPort, () => {
            logger.info(`🚀 Server is running on port ${nextPort}`);
          });
        } else {
          logger.fatal(`Port ${PORT} is already in use. Exiting.`);
          process.exit(1);
        }
      } else {
        logger.fatal({ err }, "💥 Server error");
        process.exit(1);
      }
    });
  } catch (error) {
    logger.fatal({ err: error }, "💥 Failed to start server");
    process.exit(1);
  }
};

startServer();