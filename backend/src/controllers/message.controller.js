import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import logger from '../lib/util/logger.js';
import { io } from '../lib/util/socket.js';
import {
    MESSAGES_LIMIT,
    SIDEBAR_USERS_LIMIT,
    MAX_MESSAGE_LENGTH,
    IMAGE_UPLOAD_LIMIT_BYTES,
    CLOUDINARY_IMAGE_FOLDER,
    RESOURCE_TYPE_IMAGE
} from '../constants.js'; // Assuming constants are defined here
import cloudinary from '../lib/util/cloudinary.js';
import multer from 'multer';

/**
 * @description Get users for the sidebar, excluding the logged-in user.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        if (!loggedInUserId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
        }

        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
            .select('username fullName profilePic isOnline lastSeen')
            .sort({ isOnline: -1, lastSeen: -1 })
            .limit(SIDEBAR_USERS_LIMIT); // Limit results for performance

        res.status(200).json({ success: true, users: filteredUsers });

    } catch (error) {
        logger.error({ err: error }, 'Error in getUsersForSidebar');
        res.status(500).json({ success: false, message: 'Internal server error while fetching users' });
    }
}

/**
 * @description Get messages between two users.
 * @param {object} req - Express request object containing user ID in params.
 * @param {object} res - Express response object.
 */
export const getMessagesBetweenUsers = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        if (!myId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
        }

        if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

        // Check if the user to chat with exists
        const userExists = await User.findById(userToChatId);
        if (!userExists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Use the static method from the model to get the conversation
        const messages = await Message.getConversation(myId, userToChatId, MESSAGES_LIMIT);

        res.status(200).json({ success: true, messages });

    } catch (error) {
        logger.error({ err: error }, 'Error in getMessagesBetweenUsers');
        res.status(500).json({ success: false, message: 'Internal server error while fetching messages' });
    }
}

/**
 * @description Send a message from one user to another.
 * @param {object} req - Express request object with message content and receiver ID.
 * @param {object} res - Express response object.
 */
export const sendMessage = async (req, res) => {
    try {
        logger.info('Received sendMessage request', { senderId: req.user._id, receiverId: req.params.id });
        const { text, imageUrl } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!senderId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
        }
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ success: false, message: 'Invalid receiver ID format' });
        }

        // Check if receiver exists
        const receiverExists = await User.findById(receiverId);
        if (!receiverExists) {
            return res.status(404).json({ success: false, message: 'Receiver not found' });
        }

        // Validate input: at least text or imageUrl must be provided
        if (!text?.trim() && !imageUrl) {
            return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
        }

        // ✅ FIXED: Correctly format attachments for the Message model
        const attachments = [];
        if (imageUrl && typeof imageUrl === 'string') {
            attachments.push({
                type: RESOURCE_TYPE_IMAGE,
                url: imageUrl,
                mimeType: 'image/jpeg', // Default, will be updated with actual type
                fileName: `image_${Date.now()}.jpg`,
                size: 0 // Will be updated with actual size
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message: text ? text.trim() : '',
            attachments
        });

        await newMessage.save();

        // Populate sender info for response
        await newMessage.populate('senderId', 'username fullName profilePic');
        await newMessage.populate('receiverId', 'username fullName profilePic');

        // Emit socket event to the specific receiver using rooms
        io.to(`user:${receiverId}`).emit('newMessage', newMessage);
        logger.info(`Real-time message sent to receiver: ${receiverId}`);

        // Also emit to sender to update their UI immediately
        io.to(`user:${senderId}`).emit('newMessage', newMessage);
        logger.info(`Real-time message sent to sender: ${senderId}`);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage
        });

    } catch (error) {
        logger.error({ err: error }, 'Error in sendMessage');
        res.status(500).json({ success: false, message: 'Internal server error while sending message' });
    }
}

// Use memoryStorage to handle file uploads as buffers
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: IMAGE_UPLOAD_LIMIT_BYTES }
});

/**
 * @description Middleware to handle image uploads with improved error handling.
 * @param {object} req - Express request object with the file.
 * @param {object} res - Express response object.
 */
export const uploadImage = [
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No image file provided' });
            }

            // Validate file type and size
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'
                });
            }

            if (req.file.size > IMAGE_UPLOAD_LIMIT_BYTES) {
                return res.status(400).json({
                    success: false,
                    message: `File size too large. Maximum allowed size is ${IMAGE_UPLOAD_LIMIT_BYTES / (1024 * 1024)}MB.`
                });
            }

            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: CLOUDINARY_IMAGE_FOLDER,
                        transformation: [{ width: 800, height: 600, crop: 'limit' }],
                        timeout: 120000, // 120 seconds timeout
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );

                uploadStream.on('error', (error) => {
                    logger.error({ err: error }, 'Cloudinary stream error');
                    reject(error);
                });

                uploadStream.end(req.file.buffer);
            });

            res.status(200).json({
                success: true,
                imageUrl: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                mimeType: req.file.mimetype,
                fileName: req.file.originalname || `upload_${Date.now()}`,
                size: req.file.size
            });

        } catch (error) {
            logger.error({ err: error }, 'Image upload error');
            const message = error.message.includes('timeout') ? 'Image upload timeout. Please try again.' : 'Failed to upload image';
            res.status(500).json({ success: false, message });
        }
    }
];