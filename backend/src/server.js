import express from 'express';
import authRoutes from './routes/auth.route.js';
import dotenv from 'dotenv';
import connectDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';

dotenv.config({ path: '../.env' });
connectDB();

const app = express();

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || 8000;

app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});