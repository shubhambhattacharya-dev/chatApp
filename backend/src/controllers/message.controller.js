import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../lib/util/cloudinary.js';
import fs from 'fs/promises';
import logger from '../lib/util/logger.js';
import multer from 'multer';
import {
    MESSAGES_LIMIT,
    SIDEBAR_USERS_LIMIT,
    MAX_MESSAGE_LENGTH,
    IMAGE_UPLOAD_LIMIT_BYTES,
    CLOUDINARY_IMAGE_FOLDER,
    RESOURCE_TYPE_IMAGE
} from '../constants.js';

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

// Use memoryStorage to handle file uploads as buffers instead of saving to disk
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: IMAGE_UPLOAD_LIMIT_BYTES }
});

/**
 * @description Middleware to handle image uploads. It uploads a single image
 * from a multipart/form-data request to Cloudinary and returns the secure URL.
 * @param {object} req - Express request object with the file.
 * @param {object} res - Express response object.
 */
export const uploadImage = [
    upload.single('image'),
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const uploadStream = cloudinary.uploader.upload_stream({
            folder: CLOUDINARY_IMAGE_FOLDER,
            resource_type: RESOURCE_TYPE_IMAGE,
            transformation: [{ width: 800, height: 600, crop: 'limit' }]
        }, (error, result) => {
            if (error) {
                logger.error({ err: error }, 'Error streaming image to Cloudinary');
                return res.status(500).json({ success: false, message: 'Error uploading image' });
            }
            res.status(200).json({ success: true, imageUrl: result.secure_url }); // PascalCase `result.secure_url` is from Cloudinary SDK
        });

        // Pipe the file buffer from multer into the Cloudinary upload stream
        uploadStream.end(req.file.buffer);
    }
];

/**
 * @description Send a message from one user to another.
 * @param {object} req - Express request object with message content and receiver ID.
 * @param {object} res - Express response object.
 */
export const sendMessage = async (req, res) => {
    try {
        console.log('Received sendMessage request:', { body: req.body, params: req.params });
        const { text, imageUrl } = req.body; // Changed from 'image' to 'imageUrl' for clarity
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

        const attachments = [];
        if (imageUrl) {
            attachments.push({ type: RESOURCE_TYPE_IMAGE, url: imageUrl });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message: text ? text.trim() : '',
            attachments: attachments
        });

        await newMessage.save();

        // Populate sender info for response
        await newMessage.populate('senderId', 'username fullName profilePic');
        await newMessage.populate('receiverId', 'username fullName profilePic');

        const responseMessage = newMessage.toObject();
        responseMessage.senderId = newMessage.senderId._id;
        responseMessage.receiverId = newMessage.receiverId._id;

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: responseMessage
        });

        // TODO: Implement Socket.io real-time functionality
        // io.to(receiverId).emit('newMessage', newMessage);

    } catch (error) {
        logger.error({ err: error }, 'Error in sendMessage');
        res.status(500).json({ success: false, message: 'Internal server error while sending message' });
    }
}