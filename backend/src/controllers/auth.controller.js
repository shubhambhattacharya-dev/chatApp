import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/util/generateToken.js';
import cloudinary from '../lib/util/cloudinary.js';

export const signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Input validation
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Password strength validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: fullName }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username: fullName.trim(),
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        // Save user to database
        await newUser.save();

        // Generate JWT token
        generateToken(newUser._id, res);

        // Return success response
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
                lastSeen: newUser.lastSeen
            }
        });

    } catch (error) {
        console.error('Signup error:', error);

        // Handle specific database errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body; // username OR email

if (!username || !password) {
    return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password'
    });
}

const user = await User.findOne({
    $or: [
        { email: username.toLowerCase() },
        { username: username }
    ]
});


        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update user online status and last seen
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();

        // Generate JWT token
        generateToken(user._id, res);

        // Return success response
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
                lastSeen: user.lastSeen
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const logout = async (req, res) => {
    try {
        // Get user ID from JWT token if available (set by auth middleware)
        const userId = req.user?._id;

        if (userId) {
            // Update user offline status
            const user = await User.findById(userId);
            if (user) {
                user.isOnline = false;
                user.lastSeen = new Date();
                await user.save();
            }
        }

        // Clear JWT cookie
        res.cookie('jwt', '', {
            maxAge: 0,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateProfile =async(req,res)=>{
    try {
        const { profilePic } = req.body;
        const userId=req.user._id;

        if(!userId){
            return res.status(401).json({
                success:false,
                message:"Unauthorized: User not found"
            })
        }

        const uploadResponse=await cloudinary.uploader.upload(profilePic,{
            folder:'profile_pics',
            width:150,
            crop:'scale'
        });

        const updateUser=await User.findByIdAndUpdate(userId,{
            profilePic:uploadResponse.secure_url
        },{
            new:true
        });

        res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            user:updateUser
        })

        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        
    }
}

export const checkAuth=async(req,res)=>{
    try {
       res.status(200).json({
        success:true,
        message:"User is authenticated",
        user:req.user
       }) 
    } catch (error) {
        console.error('Check auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        
    }
}

export default { signup, login, logout };
