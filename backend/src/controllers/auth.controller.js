import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from '../lib/util/generateToken.js';
import cloudinary from '../lib/util/cloudinary.js';
import logger from '../lib/util/logger.js';

// ==================== SIGNUP ====================
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body; // Data is already validated and sanitized

    // Generate username and validate uniqueness
    const username = fullName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Full name must contain at least 3 alphanumeric characters for username generation',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    // Save user
    await newUser.save();

    // Generate JWT token and set cookie
    generateToken(newUser._id, res);

    // Return response
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
  } catch (error) {
    logger.error({ err: error }, 'Signup error');

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`,
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during signup',
    });
  }
};

// ==================== LOGIN ====================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body; // Data is already validated

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token and set cookie
    generateToken(user._id, res);

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
  } catch (error) {
    logger.error({ err: error }, 'Login error');
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
    });
  }
};

// ==================== LOGOUT ====================
export const logout = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();
      }
    }

    // Clear cookie
    res.cookie('jwt', '', {
      maxAge: 0,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error({ err: error }, 'Logout error');
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
    });
  }
};

// ==================== UPDATE PROFILE ====================
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not found',
      });
    }

    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: 'profile_pics',
        width: 150,
        crop: 'scale',
      });
    } catch (error) {
      logger.error({ err: error }, 'Error uploading to Cloudinary');
      return res.status(500).json({
        success: false,
        message: 'Error uploading profile picture',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        isOnline: updatedUser.isOnline,
        lastSeen: updatedUser.lastSeen,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Update profile error');
    res.status(500).json({
      success: false,
      message: 'Internal server error during profile update',
    });
  }
};

// ==================== CHECK AUTH ====================
export const checkAuth = async (req, res) => {
	// The `protectRoute` middleware already handles token verification and attaches the user.
	// If we reach this point, the user is authenticated.
	res.status(200).json({
		success: true,
		message: 'User is authenticated',
		user: req.user, // req.user is populated by protectRoute
	});
};
