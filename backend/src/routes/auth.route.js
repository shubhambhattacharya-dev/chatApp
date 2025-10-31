import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { signup, login, logout, updateProfile, checkAuth, deleteUser } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { validateSignup, validateLogin, validateUpdateProfile } from '../middleware/validation.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import { AUTH_ROUTES_LIMIT, FIFTEEN_MINUTES_IN_MS } from '../constants.js';

const router = express.Router();

// Apply rate limiting to authentication routes to prevent brute-force attacks
const authLimiter = rateLimit({
	windowMs: FIFTEEN_MINUTES_IN_MS,
	limit: AUTH_ROUTES_LIMIT,
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
});

router.post('/signup', authLimiter, validateSignup, signup);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', protectRoute, logout);


router.put('/update-profile', authLimiter, protectRoute, uploadSingleImage('profilePic'), validateUpdateProfile, updateProfile);
router.get('/check-auth', protectRoute, checkAuth);
router.delete('/delete-account', authLimiter, protectRoute, deleteUser);
export default router;