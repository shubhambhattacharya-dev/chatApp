import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import multer from "multer";

import cloudinary from "../lib/util/cloudinary.js";
import { CLOUDINARY_IMAGE_FOLDER, RESOURCE_TYPE_IMAGE, IMAGE_UPLOAD_LIMIT_BYTES, MESSAGES_LIMIT } from "../constants.js";
import { getAllUserSockets, io } from "../lib/util/socket.js";
import logger from "../lib/util/logger.js";

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
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

export const uploadImage = [
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided." });
      }

      // req.file.buffer contains the image file
      // Upload to Cloudinary directly from buffer
      const uploadResponse = await cloudinary.uploader.upload_stream(
        { folder: CLOUDINARY_IMAGE_FOLDER, resource_type: RESOURCE_TYPE_IMAGE },
        (error, result) => {
          if (error) {
            logger.error({ err: error }, 'Error uploading to Cloudinary stream');
            return res.status(500).json({ error: "Error uploading image to Cloudinary." });
          }
          res.status(200).json({ imageUrl: result.secure_url });
        }
      ).end(req.file.buffer);
    } catch (error) {
      logger.error("Error in uploadImage controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
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
    }).sort({ createdAt: 1 }).limit(MESSAGES_LIMIT).populate("senderId", "fullName profilePic");

    res.status(200).json(messages);
  } catch (error) {
    logger.error({ err: error }, "Error in getMessages controller");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message, imageUrl } = req.body;
    const { id: receiverId } = req.params;
    if (!req.user || !req.user._id) {
      logger.warn('Send message attempt without authenticated user.');
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }
    const senderId = req.user._id;

    const attachments = imageUrl ? [{ type: 'image', url: imageUrl }] : [];

    if (!message && attachments.length === 0) {
      return res.status(400).json({ error: "Message content cannot be empty." });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      attachments,
    });

    await newMessage.save();

    // Populate sender details for the real-time event
    await newMessage.populate('senderId', 'fullName profilePic');

    logger.info(`Message saved and populated: ${newMessage._id}, sender: ${senderId}, receiver: ${receiverId}`);

    const receiverSockets = getAllUserSockets(receiverId);
    const senderSockets = getAllUserSockets(senderId);

    // Emit to all receiver's sockets
    receiverSockets.forEach(socketId => {
      logger.info(`Emitting newMessage to receiver socket: ${socketId}`);
      io.to(socketId).emit("newMessage", newMessage);
    });

    // Emit to all sender's sockets (excluding receiver sockets if sender is also receiver)
    senderSockets.forEach(socketId => {
      if (!receiverSockets.includes(socketId)) {
        logger.info(`Emitting newMessage to sender socket: ${socketId}`);
        io.to(socketId).emit("newMessage", newMessage);
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    logger.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
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

    // Check if the user trying to delete the message is the sender
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this message." });
    }

    await Message.findByIdAndDelete(messageId);

    // Emit real-time deletion event to both sender and receiver
    const receiverSockets = getAllUserSockets(message.receiverId);
    const senderSockets = getAllUserSockets(message.senderId);

    // Emit to all receiver's sockets
    receiverSockets.forEach(socketId => {
      io.to(socketId).emit("messageDeleted", messageId);
    });

    // Emit to all sender's sockets (excluding receiver sockets if sender is also receiver)
    senderSockets.forEach(socketId => {
      if (!receiverSockets.includes(socketId)) {
        io.to(socketId).emit("messageDeleted", messageId);
      }
    });

    res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    logger.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};