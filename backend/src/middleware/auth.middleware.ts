import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import logger from '../lib/util/logger.js';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types.js';
import config from '../config.js';

interface JwtPayload {
  userId: string;
}

export const protectRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided"
            });
        }

        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found"
            });
        }

        req.user = user;
        next();

    } catch (error: any) {
        logger.error({ message: error.message, stack: error.stack }, 'Authentication error in protectRoute');

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token expired"
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error: Authentication failed unexpectedly"
        });
    }
};
