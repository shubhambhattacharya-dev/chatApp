import Message, { IMessage } from "../models/message.model.js";
import User, { IUser } from "../models/user.model.js";
import { AppError } from "../lib/util/error.js";
import { getAllUserSockets, io } from "../lib/util/socket.js";
import { Types } from "mongoose";

export const getSidebarUsers = async (loggedInUserId: string | Types.ObjectId): Promise<IUser[]> => {
  return await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
};

export const getMessagesBetween = async (
  myId: string | Types.ObjectId,
  userToChatId: string | Types.ObjectId,
  page: number,
  limit: number
): Promise<IMessage[]> => {
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

  return messages.reverse();
};

export const sendMessage = async (
  senderId: string | Types.ObjectId,
  receiverId: string | Types.ObjectId,
  message: string,
  imageUrl?: string
): Promise<IMessage> => {
  const sanitizedMessage = message ? message.replace(/<[^>]*>/g, '').trim() : '';
  const attachments = imageUrl ? [{ type: 'image' as const, url: imageUrl }] : [];

  if (!sanitizedMessage && attachments.length === 0) {
    throw new AppError("Message content cannot be empty", 400);
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    message: sanitizedMessage,
    attachments,
  });

  await newMessage.save();
  await newMessage.populate('senderId', 'fullName profilePic');

  // Socket notification
  const receiverSockets = getAllUserSockets(receiverId.toString());
  const senderSockets = getAllUserSockets(senderId.toString());
  const allSockets = new Set([...receiverSockets, ...senderSockets]);

  allSockets.forEach(socketId => {
    io.to(socketId).emit("newMessage", newMessage);
  });

  return newMessage;
};

export const deleteUserMessage = async (userId: string | Types.ObjectId, messageId: string): Promise<boolean> => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError("Message not found", 404);
  }

  if (message.senderId.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to delete this message", 403);
  }

  await Message.findByIdAndDelete(messageId);

  const receiverSockets = getAllUserSockets(message.receiverId.toString());
  const senderSockets = getAllUserSockets(message.senderId.toString());
  const allSockets = new Set([...receiverSockets, ...senderSockets]);

  allSockets.forEach(socketId => {
    io.to(socketId).emit("messageDeleted", messageId);
  });

  return true;
};
