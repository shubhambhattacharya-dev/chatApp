import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import multer from "multer";

import cloudinary from "../lib/util/cloudinary.js";
import { CLOUDINARY_IMAGE_FOLDER, RESOURCE_TYPE_IMAGE } from "../constants.js";
import { getReceiverSocketId, io } from "../lib/util/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json({ users: filteredUsers });
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadImage = [
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided." });
      }

      // req.file.buffer contains the image file
      // Upload to Cloudinary from buffer
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: CLOUDINARY_IMAGE_FOLDER,
        resource_type: RESOURCE_TYPE_IMAGE,
      });

      res.status(200).json({ imageUrl: uploadResponse.secure_url });
    } catch (error) {
      console.log("Error in uploadImage controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).populate("senderId", "fullName profilePic");

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message, imageUrl } = req.body;
    const { id: receiverId } = req.params;
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

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};