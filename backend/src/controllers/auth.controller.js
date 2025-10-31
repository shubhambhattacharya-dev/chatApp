import fs from 'fs';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from '../lib/util/generateToken.js';
import cloudinary, { cloudinaryConfigured } from '../lib/util/cloudinary.js';
import logger from '../lib/util/logger.js';
import { CLOUDINARY_IMAGE_FOLDER } from '../constants.js';

// ==================== SIGNUP ====================
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body; // Data is already validated and sanitized

    let baseUsername = fullName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    if (baseUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Full name must contain at least 3 alphanumeric characters for username generation',
      });
    }

    let username = baseUsername;
    let userExists = await User.findOne({ username });
    let suffix = 1;
    while (userExists) {
      username = `${baseUsername}${suffix}`;
      userExists = await User.findOne({ username });
      suffix++;
      if (suffix > 1000) { // Prevent excessively long loops, though highly unlikely to reach
        return res.status(500).json({
          success: false,
          message: 'Could not generate a unique username after many attempts. Please try a different full name.',
        });
      }
    }



    // Check if user already exists with email
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

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
    logger.error({ message: error.message }, 'Signup error');

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
    logger.error({ message: error.message }, 'Login error');
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error during login',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

// ==================== LOGOUT ====================
export const logout = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      logger.warn('Logout attempt without authenticated user.');
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found.' });
    }
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
      await user.save();
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
    logger.error({ message: error.message }, 'Logout error');
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error during logout',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

// ==================== UPDATE PROFILE ====================
export const updateProfile = async (req, res) => {
  let uploadedFilePath = null; // To store the path of the file uploaded by multer
  try {
    if (!req.user || !req.user._id) {
      logger.warn('Update profile attempt without authenticated user.');
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found.' });
    }
    const userId = req.user._id;

    let updatedProfilePicUrl = req.user.profilePic; // Default to current profile pic

    if (req.file) {
      if (!cloudinaryConfigured) {
        logger.warn('Cloudinary not configured, skipping profile picture upload');
        return res.status(400).json({
          success: false,
          message: 'Cloudinary is not configured. Profile picture upload is unavailable.',
        });
      }

      uploadedFilePath = req.file.path; // Store the path for potential cleanup
      let uploadResponse;
      try {
        // Cloudinary's uploader.upload method can directly handle file paths.
        uploadResponse = await cloudinary.uploader.upload(uploadedFilePath, {
          folder: CLOUDINARY_IMAGE_FOLDER,
          width: 150,
          crop: 'scale',
          timeout: 60000, // Increase timeout to 60 seconds
        });
        updatedProfilePicUrl = uploadResponse.secure_url;
      } catch (error) {
        logger.error({ message: error.message, stack: error.stack }, 'Error uploading to Cloudinary');
        return res.status(500).json({
          success: false,
          message: 'Error uploading profile picture',
        });
      } finally {
        // Clean up the temporary file uploaded by multer
        if (uploadedFilePath) {
          fs.unlink(uploadedFilePath, (err) => {
            if (err) logger.error({ err }, 'Error deleting temporary file');
          });
        }
      }
    }

    const { fullName, email, password } = req.body;
    const updateFields = {};

    if (fullName) {
      updateFields.fullName = fullName.trim();
    }
    if (email) {
      updateFields.email = email.toLowerCase().trim();
    }
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    // Always update profilePic if it was uploaded or if it's explicitly set to null/empty
    updateFields.profilePic = updatedProfilePicUrl;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error({ message: error.message, stack: error.stack }, 'Update profile error');
    // Ensure temporary file is deleted even if other errors occur
    if (uploadedFilePath) {
      fs.unlink(uploadedFilePath, (err) => {
        if (err) logger.error({ err }, 'Error deleting temporary file in catch block');
      });
    }

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

// ==================== DELETE USER ====================
export const deleteUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      logger.warn('Delete user attempt without authenticated user.');
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found.' });
    }
    const authUserId = req.user._id;

    const user = await User.findById(authUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Delete all messages sent by or received by the user
    await Message.deleteMany({
      $or: [{ senderId: authUserId }, { receiverId: authUserId }],
    });

    // Delete the user account
    await User.findByIdAndDelete(authUserId);

    // Clear cookie after successful deletion
    res.cookie('jwt', '', {
      maxAge: 0,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
      success: true,
      message: "User and associated messages deleted successfully.",
    });
  } catch (error) {
    logger.error({ message: error.message }, 'Delete user error');
    res.status(500).json({
      success: false,
      message: 'Internal server error during user deletion',
    });
  }
};
