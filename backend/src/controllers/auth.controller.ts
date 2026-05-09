import fs from 'fs';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import { generateToken } from '../lib/util/generateToken.js';
import cloudinary, { cloudinaryConfigured } from '../lib/util/cloudinary.js';
import logger from '../lib/util/logger.js';
import { CLOUDINARY_IMAGE_FOLDER } from '../constants.js';
import { validationResult } from 'express-validator';
import { catchAsync, AppError } from '../lib/util/error.js';
import * as authService from '../services/auth.service.js';
import { Response, Request } from 'express';
import { AuthRequest } from '../types.js';

const validateRequest = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }
};

export const signup = catchAsync(async (req: Request, res: Response) => {
  validateRequest(req);
  
  const newUser = await authService.createUser(req.body);
  generateToken(newUser._id as string, res);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      _id: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      isOnline: newUser.isOnline,
      lastSeen: newUser.lastSeen,
      createdAt: newUser.createdAt,
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  validateRequest(req);
  const { email, password } = req.body;

  const user = await authService.validateUser(email, password);

  if (user.isOnline) {
    throw new AppError('User is already logged in from another session', 409);
  }

  user.isOnline = true;
  user.lastSeen = new Date();
  await user.save();

  generateToken(user._id as string, res);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
    },
  });
});

export const logout = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) {
    throw new AppError('Unauthorized', 401);
  }

  const user = await User.findById(req.user._id);
  if (user) {
    user.isOnline = false;
    user.lastSeen = new Date();
    await user.save();
  }

  res.cookie('jwt', '', {
    maxAge: 0,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  validateRequest(req);
  
  if (!req.user?._id) {
    throw new AppError('Unauthorized', 401);
  }

  const userId = req.user._id;
  let updatedProfilePicUrl = req.user.profilePic;

  if (req.file) {
    if (!cloudinaryConfigured) {
      throw new AppError('Profile picture upload is currently unavailable', 503);
    }

    try {
      const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: CLOUDINARY_IMAGE_FOLDER,
        width: 150,
        crop: 'scale',
      });
      updatedProfilePicUrl = uploadResponse.secure_url;
    } finally {
      fs.unlink(req.file.path, (err) => {
        if (err) logger.error({ err }, 'Error deleting temporary file');
      });
    }
  }

  const { fullName, email, password } = req.body;
  const updateFields: any = { profilePic: updatedProfilePicUrl };

  if (fullName) updateFields.fullName = fullName.trim();
  if (email) updateFields.email = email.toLowerCase().trim();
  if (password) {
    const bcrypt = await import('bcryptjs');
    updateFields.password = await bcrypt.default.hash(password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser,
  });
});

export const checkAuth = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }
  res.status(200).json({
    success: true,
    message: 'Authenticated',
    user: req.user,
  });
});

export const deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) {
    throw new AppError('Unauthorized', 401);
  }

  const authUserId = req.user._id;
  await Message.deleteMany({
    $or: [{ senderId: authUserId }, { receiverId: authUserId }],
  });
  await User.findByIdAndDelete(authUserId);

  res.cookie('jwt', '', { maxAge: 0, httpOnly: true });

  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});
