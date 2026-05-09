import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import logger from './logger.js';
import config from '../../config.js';
import { Types } from 'mongoose';

export const generateToken = (userId: string | Types.ObjectId, res: Response): string => {
    try {
        const options: SignOptions = {
            expiresIn: config.jwt.expiresIn as any,
        };

        const token = jwt.sign({ userId }, config.jwt.secret, options);

        // Cookie options
        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true, // Prevent XSS attacks
            sameSite: config.env === 'production' ? 'lax' : 'lax',
            secure: config.env === 'production', // HTTPS only in production
        });

        return token;
    } catch (error: any) {
        logger.error({ err: error }, 'Token generation error:');
        throw new Error('Failed to generate authentication token');
    }
};
