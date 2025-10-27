import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";


import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js"
import connectDB from "./db/connectMongoDB.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

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
  console.error("🔥 An unexpected error occurred:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  connectDB();
});
