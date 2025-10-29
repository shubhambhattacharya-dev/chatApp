import express from 'express'
import { rateLimit } from 'express-rate-limit';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getUsersForSidebar, getMessagesBetweenUsers, sendMessage, uploadImage } from "../controllers/message.controller.js"
import { validateSendMessage } from '../middleware/validation.middleware.js';
import { MESSAGE_ROUTES_LIMIT, FIFTEEN_MINUTES_IN_MS } from '../constants.js';

const router=express.Router();

// Apply rate limiting to message-related routes to prevent spam
const messageLimiter = rateLimit({
	windowMs: FIFTEEN_MINUTES_IN_MS,
	limit: MESSAGE_ROUTES_LIMIT,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
    message: { success: false, message: 'Too many messages sent from this IP, please try again after 15 minutes' },
});


router.get('/users',protectRoute,getUsersForSidebar);
router.get('/:id', protectRoute, getMessagesBetweenUsers);
router.post('/send/:id', protectRoute, messageLimiter, sendMessage);
router.post('/upload-image', protectRoute, messageLimiter, uploadImage);

export default router;
