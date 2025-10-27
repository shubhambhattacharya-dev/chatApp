
import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
    try {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        // Cookie options
        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true, // Prevent XSS attacks
            sameSite: 'strict', // CSRF protection
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        });

        return token;
    } catch (error) {
        console.error('Token generation error:', error);
        throw new Error('Failed to generate authentication token');
    }
};
