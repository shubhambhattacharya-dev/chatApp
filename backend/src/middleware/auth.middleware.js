import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import logger from '../lib/util/logger.js';

export const protectRoute = async (req, res, next) => {
    try {
        // Ensure JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
            logger.fatal('JWT_SECRET is not defined in protectRoute middleware.');
            return res.status(500).json({
                success: false,
                message: "Internal Server Error: JWT secret not configured."
            });
        }

        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });



        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found"
            });
        }

        req.user = user;
        next();

    } catch (error) {
        logger.error({ message: error.message, stack: error.stack }, 'Authentication error in protectRoute'); // Add stack trace for better debugging

        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                message: "Unauthorized: Token expired"
            });
        }

        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token"
            });
        }

        // For any other unexpected errors, return a 500 Internal Server Error
        res.status(500).json({ // Changed to 500 for unhandled errors
            success: false,
            message: "Internal Server Error: Authentication failed unexpectedly"
        });
    }
};