
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";

import cloudinary from "../lib/util/cloudinary.js";
import { CLOUDINARY_IMAGE_FOLDER, RESOURCE_TYPE_IMAGE, IMAGE_UPLOAD_LIMIT_BYTES, MESSAGES_LIMIT } from "../constants.js";
import { getAllUserSockets, io } from "../lib/util/socket.js";
import logger from "../lib/util/logger.js";
import { validationResult } from "express-validator";

export const getUsersForSidebar = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      logger.warn('Get users for sidebar attempt without authenticated user.');
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json({ users: filteredUsers });
  } catch (error) {
    logger.error({ message: error.message }, "Error in getUsersForSidebar");
    res.status(500).json({ error: "Internal server error" });
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: IMAGE_UPLOAD_LIMIT_BYTES },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'), false);
  },
});

export const uploadImage = [
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided." });
      }

      const fileType = await fileTypeFromBuffer(req.file.buffer);
      if (!fileType || !/jpeg|jpg|png|gif|webp/.test(fileType.ext)) {
        return res.status(400).json({ error: 'Invalid file type. Only image files are allowed.' });
      }

      let uploadResponse;
      try {
        uploadResponse = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: CLOUDINARY_IMAGE_FOLDER,
              resource_type: RESOURCE_TYPE_IMAGE,
              timeout: 60000,
            },
            (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
      } catch (cloudinaryError) {
        logger.error("Cloudinary upload error: ", cloudinaryError.message);
        return res.status(500).json({ error: "Failed to upload image to cloud storage" });
      }

      res.status(200).json({ imageUrl: uploadResponse.secure_url });
    } catch (error) {
      logger.error("Error in uploadImage controller: ", error.message);
      res.status(500).json({ error: "Internal server error during image upload" });
    }
  },
];

export const getMessagesBetweenUsers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id: userToChatId } = req.params;
    const { page = 1, limit = MESSAGES_LIMIT } = req.query;

    if (!req.user || !req.user._id) {
      logger.warn('Get messages between users attempt without authenticated user.');
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("senderId", "fullName profilePic");

    res.status(200).json(messages.reverse());
  } catch (error) {
    logger.error({ err: error }, "Error in getMessages controller");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { message, imageUrl } = req.body;
    const { id: receiverId } = req.params;
    if (!req.user || !req.user._id) {
      logger.warn('Send message attempt without authenticated user.');
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }
    const senderId = req.user._id;

    const sanitizedMessage = message ? message.replace(/<[^>]*>/g, '').trim() : '';
    const attachments = imageUrl ? [{ type: 'image', url: imageUrl }] : [];

    if (!sanitizedMessage && attachments.length === 0) {
      return res.status(400).json({ error: "Message content cannot be empty." });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message: sanitizedMessage,
      attachments,
    });

    await newMessage.save();
    await newMessage.populate('senderId', 'fullName profilePic');

    logger.info(`Message saved and populated: ${newMessage._id}, sender: ${senderId}, receiver: ${receiverId}`);

    const receiverSockets = getAllUserSockets(receiverId);
    const senderSockets = getAllUserSockets(senderId);
    const allSockets = new Set([...receiverSockets, ...senderSockets]);

    allSockets.forEach(socketId => {
      logger.info(`Emitting newMessage to socket: ${socketId}`);
      io.to(socketId).emit("newMessage", newMessage);
    });

    res.status(201).json(newMessage);
  } catch (error) {
    logger.error("Error in createMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id: messageId } = req.params;
    if (!req.user || !req.user._id) {
      logger.warn('Delete message attempt without authenticated user.');
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this message." });
    }

    await Message.findByIdAndDelete(messageId);

    const receiverSockets = getAllUserSockets(message.receiverId);
    const senderSockets = getAllUserSockets(message.senderId);

    const allSockets = new Set([...receiverSockets, ...senderSockets]);

    allSockets.forEach(socketId => {
      io.to(socketId).emit("messageDeleted", messageId);
    });

    res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    logger.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessageAsRead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id: messageId } = req.params;
    if (!req.user || !req.user._id) {
      logger.warn('Mark message as read attempt without authenticated user.');
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    if (message.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You are not authorized to mark this message as read." });
    }

    if (message.isRead) {
      return res.status(200).json({ message: "Message is already marked as read." });
    }

    await message.markAsRead();

    const receiverSockets = getAllUserSockets(message.receiverId);
    const senderSockets = getAllUserSockets(message.senderId);

    const allSockets = new Set([...receiverSockets, ...senderSockets]);

    allSockets.forEach(socketId => {
      io.to(socketId).emit("messageRead", { messageId, readAt: message.readAt });
    });

    res.status(200).json({ message: "Message marked as read successfully.", readAt: message.readAt });
  } catch (error) {
    logger.error("Error in markMessageAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
