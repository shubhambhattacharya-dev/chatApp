import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js"
import connectDB from "./db/connectMongoDB.js";
import logger from "./lib/util/logger.js";
import {app,server} from "./lib/util/socket.js"


dotenv.config();

const PORT = Number(process.env.PORT) || 8000;

// Validate essential environment variables on startup
const requiredEnv = [
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    logger.fatal(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers
app.use(morgan('combined')); // HTTP request logging
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: "10kb" })); // Reasonable limit for JSON payloads to prevent DoS
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

const startServer = async (port) => {
  try {
    await connectDB();
    await new Promise((resolve, reject) => {
      server.listen(port, resolve);
      server.on('error', reject);
    });
    logger.info(`🚀 Server is running on port ${port}`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      logger.warn(`💥 Port ${port} is already in use, trying port ${port + 1}...`);
      // Recursively try next port
      await startServer(port + 1);
    } else {
      logger.fatal({ err: error }, "💥 Failed to start server");
      process.exit(1); // Exit gracefully after logging the fatal error
    }
  }
};

startServer(PORT);
