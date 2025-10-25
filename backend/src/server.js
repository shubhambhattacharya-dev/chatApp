import express from 'express';
import authRoutes from './routes/auth.route.js';
import dotenv from 'dotenv';
import connectDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/message.route.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config({ path: '../.env' });
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true
    }
});

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || 8000;

app.use('/api/auth', authRoutes);
app.use('/api/messages',messageRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user joining their room
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    // Handle sending messages
    socket.on('sendMessage', (data) => {
        // Emit to receiver
        socket.to(data.receiverId).emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(port, () => {
    console.log(`http://localhost:${port}`);
});