import express, { Request, Response, NextFunction } from "express";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import config from "./config.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import connectDB from "./db/connectMongoDB.js";
import logger from "./lib/util/logger.js";
import { initSocket } from "./lib/util/socket.js";
import { AppError } from "./lib/util/error.js";

const app = express();
let server: http.Server | https.Server;

// HTTPS Setup for production if certificates are provided
if (config.env === 'production' && process.env.HTTPS_KEY && process.env.HTTPS_CERT) {
  const options = {
    key: fs.readFileSync(process.env.HTTPS_KEY),
    cert: fs.readFileSync(process.env.HTTPS_CERT),
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

server.setMaxListeners(200);
initSocket(server);

app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "*.cloudinary.com"],
      "connect-src": ["'self'", "*.cloudinary.com", "data:", "ws:", "wss:", ...config.cors.origins],
    },
  },
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use('/api', limiter);

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// CORS Configuration
app.use('/api', cors({
  origin: config.env === 'development' ? true : config.cors.origins,
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Static files & Frontend integration
if (config.env === 'production') {
  app.use(express.static(config.paths.frontendDist));
  app.get('*path', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(config.paths.frontendDist, 'index.html'));
  });
}

// Global 404 handler
app.all('*path', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error({ err, req }, `Error: ${err.message}`);

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: config.env === 'development' || err.isOperational ? err.message : 'Something went wrong!',
    ...(config.env === 'development' && { stack: err.stack }),
  });
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(config.port, () => {
      logger.info(`🚀 Server is running on port ${config.port} [${config.env}]`);
    });
  } catch (error: any) {
    logger.fatal({ err: error }, "💥 Failed to start server");
    process.exit(1);
  }
};

startServer();
