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

    // Hash password with configurable salt rounds
    const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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
    }).select('+password +loginAttempts +lockUntil');

    // Check if account is locked
    if (user?.isLocked()) {
      const lockTimeLeft = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked. Try again in ${lockTimeLeft} minutes.`,
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      await user.incLoginAttempts();

      if (user.loginAttempts >= 5) {
        return res.status(423).json({
          success: false,
          message: 'Account locked due to too many failed attempts. Try again in 30 minutes.',
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

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
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not found',
      });
    }

    let profilePicUrl = null;

    // Check if profilePic is in form data (file upload)
    if (req.file) {
      try {
        // Validate file type and size for profile pictures
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed for profile pictures.'
            });
        }

        const maxProfilePicSize = 2 * 1024 * 1024; // 2MB for profile pics
        if (req.file.size > maxProfilePicSize) {
            return res.status(400).json({
                success: false,
                message: 'Profile picture too large. Maximum allowed size is 2MB.'
            });
        }

        const uploadResponse = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'profile_pics',
                    width: 150,
                    crop: 'scale',
                    timeout: 60000,
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            stream.on('error', (error) => {
                logger.error({ err: error }, 'Cloudinary profile pic upload error');
                reject(error);
            });

            stream.end(req.file.buffer);
        });

        profilePicUrl = uploadResponse.secure_url;
      } catch (error) {
        logger.error({ err: error }, 'Error uploading to Cloudinary');
        return res.status(500).json({
          success: false,
          message: 'Error uploading profile picture',
        });
      }
    } else if (req.body.profilePic) {
      // Handle base64 data URI
      try {
        // Validate base64 data
        if (!req.body.profilePic.startsWith('data:image/')) {
          return res.status(400).json({
            success: false,
            message: 'Invalid image format. Must be a valid data URL.'
          });
        }

        // Check approximate size (base64 is ~33% larger than binary)
        const approxSize = (req.body.profilePic.length * 0.75);
        if (approxSize > 2 * 1024 * 1024) { // 2MB
          return res.status(400).json({
            success: false,
            message: 'Profile picture too large. Maximum allowed size is 2MB.'
          });
        }

        const uploadResponse = await cloudinary.uploader.upload(req.body.profilePic, {
          folder: 'profile_pics',
          width: 150,
          crop: 'scale',
          timeout: 60000,
        });
        profilePicUrl = uploadResponse.secure_url;
      } catch (error) {
        logger.error({ err: error }, 'Error uploading base64 profile picture to Cloudinary');
        return res.status(500).json({
          success: false,
          message: 'Error uploading profile picture',
        });
      }
    }

    if (!profilePicUrl) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture provided',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: profilePicUrl },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
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
