
import express from "express";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
let server;

if (process.env.NODE_ENV === 'production' && process.env.HTTPS_KEY && process.env.HTTPS_CERT) {
  const options = {
    key: fs.readFileSync(process.env.HTTPS_KEY),
    cert: fs.readFileSync(process.env.HTTPS_CERT),
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

server.setMaxListeners(100);
initSocket(server);

const PORT = process.env.PORT || 5000;


const requiredEnv = ['MONGO_DB', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'NODE_ENV'];
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    logger.fatal(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "*.cloudinary.com"],
        "connect-src": ["'self'", "*.cloudinary.com", "data:", "ws:", "wss:", "http://localhost:5000", "http://localhost:5001", "http://localhost:5002", "https://justchat-d566.onrender.com"],
      },
    },
    strictTransportSecurity: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: "deny",
    },
    xssFilter: true,
    noSniff: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use('/api', limiter);

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://justchat-d566.onrender.com'];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS only to API routes
app.use('/api', cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve static files from the frontend build directory in production
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  // Catch all handler: send back index.html for any non-API routes
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
          res.status(500).json({ success: false, message: "Internal Server Error" });
        }
      });
    } else {
      next();
    }
  });
}

// Root endpoint for API status
app.get('/api', (req, res) => {
  res.json({ success: true, message: "Welcome to JustChat API", version: "1.0.0" });
});

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

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
