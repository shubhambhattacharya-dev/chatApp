import express from 'express';
import { signup, login, logout, updateProfile, checkAuth, deleteUser } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { validateSignup, validateLogin, validateUpdateProfile } from '../middleware/validation.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/logout', protectRoute, logout);

router.put('/update-profile', protectRoute, uploadSingleImage('profilePic'), validateUpdateProfile, updateProfile);

router.get('/check', protectRoute, checkAuth);

router.delete('/delete-account', protectRoute, deleteUser);

export default router;
