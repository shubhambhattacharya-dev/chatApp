import express from 'express';
import authRoutes from './routes/auth.route.js';
import dotenv from 'dotenv';
import connectDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/message.route.js';
import cors from 'cors';
import { createServer } from 'http';


dotenv.config({ path: '../.env' });
connectDB();

const app = express();
const server = createServer(app);

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || 8000;

app.use('/api/auth', authRoutes);
app.use('/api/messages',messageRoutes);

// Socket.io connection handling

server.listen(port, () => {
    console.log(`http://localhost:${port}`);
});