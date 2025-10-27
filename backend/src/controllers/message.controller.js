import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../lib/util/cloudinary.js';

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        if (!loggedInUserId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
        }

        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
            .select('username fullName profilePic isOnline lastSeen')
            .sort({ isOnline: -1, lastSeen: -1 })
            .limit(50); // Limit results for performance

        res.status(200).json({ success: true, users: filteredUsers });

    } catch (error) {
        console.error('Error in getUsersForSidebar:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching users' });
    }
}

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

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })
        .sort({ createdAt: 1 })
        .limit(100) // Limit for performance
        .populate('senderId', 'username fullName profilePic')
        .populate('receiverId', 'username fullName profilePic');

        res.status(200).json({ success: true, messages });

    } catch (error) {
        console.error('Error in getMessagesBetweenUsers:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching messages' });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image, file } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!senderId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
        }

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ success: false, message: 'Invalid receiver ID format' });
        }

        // Validate message content
        if ((!text || text.trim().length === 0) && !image && !file) {
            return res.status(400).json({ success: false, message: 'Message text is required' });
        }

        if (text.length > 1000) {
            return res.status(400).json({ success: false, message: 'Message text cannot exceed 1000 characters' });
        }

        // Check if receiver exists
        const receiverExists = await User.findById(receiverId);
        if (!receiverExists) {
            return res.status(404).json({ success: false, message: 'Receiver not found' });
        }

        const attachments = [];

        try {
            if (image) {
                if (!image.startsWith('data:image/')) {
                    return res.status(400).json({ success: false, message: 'Invalid image format' });
                }
                const uploadedImage = await cloudinary.uploader.upload(image, {
                    folder: 'chatApp/images',
                    resource_type: 'image',
                    transformation: [{ width: 800, height: 600, crop: 'limit' }]
                });
                attachments.push({ type: 'image', url: uploadedImage.secure_url });
            }

            if (file) {
                if (!file.startsWith('data:')) {
                    return res.status(400).json({ success: false, message: 'Invalid file format' });
                }
                const uploadedFile = await cloudinary.uploader.upload(file, {
                    folder: 'chatApp/files',
                    resource_type: 'raw',
                    max_file_size: 10 * 1024 * 1024 // 10MB limit
                });
                attachments.push({ type: 'file', url: uploadedFile.secure_url });
            }
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            return res.status(500).json({ success: false, message: 'Error uploading attachment' });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message: text.trim(),
            attachments: attachments
        });

        await newMessage.save();

        // Populate sender info for response
        await newMessage.populate('senderId', 'username fullName profilePic');
        await newMessage.populate('receiverId', 'username fullName profilePic');

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage
        });

        // TODO: Implement Socket.io real-time functionality
        // io.to(receiverId).emit('newMessage', newMessage);

    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ success: false, message: 'Internal server error while sending message' });
    }
}