import { fileTypeFromBuffer } from "file-type";
import cloudinary from "../lib/util/cloudinary.js";
import { CLOUDINARY_IMAGE_FOLDER, RESOURCE_TYPE_IMAGE, MESSAGES_LIMIT } from "../constants.js";
import { catchAsync, AppError } from "../lib/util/error.js";
import * as messageService from "../services/message.service.js";
import { validationResult } from "express-validator";
import { Response, Request } from 'express';
import { AuthRequest } from '../types.js';

const validateRequest = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }
};

export const getUsersForSidebar = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) throw new AppError('Unauthorized', 401);
  const users = await messageService.getSidebarUsers(req.user._id as string);
  res.status(200).json({ users });
});

export const uploadImage = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new AppError("No image file provided", 400);

  const fileType = await fileTypeFromBuffer(req.file.buffer);
  if (!fileType || !/jpeg|jpg|png|gif|webp/.test(fileType.ext)) {
    throw new AppError('Invalid file type. Only image files are allowed', 400);
  }

  const uploadResponse = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_IMAGE_FOLDER, resource_type: RESOURCE_TYPE_IMAGE },
      (error, result) => {
        if (error) return reject(new AppError("Cloudinary upload failed", 500));
        resolve(result);
      }
    );
    uploadStream.end(req.file!.buffer);
  });

  res.status(200).json({ imageUrl: uploadResponse.secure_url });
});

export const getMessagesBetweenUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  validateRequest(req);
  if (!req.user?._id) throw new AppError('Unauthorized', 401);

  const { id: userToChatId } = req.params;
  const { page = 1, limit = MESSAGES_LIMIT } = req.query;

  const messages = await messageService.getMessagesBetween(
    req.user._id as string,
    userToChatId as string,
    parseInt(page as string),
    parseInt(limit as string)
  );

  res.status(200).json(messages);
});

export const createMessage = catchAsync(async (req: AuthRequest, res: Response) => {
  validateRequest(req);
  if (!req.user?._id) throw new AppError('Unauthorized', 401);

  const { message, imageUrl } = req.body;
  const { id: receiverId } = req.params;

  const newMessage = await messageService.sendMessage(
    req.user._id as string,
    receiverId as string,
    message,
    imageUrl
  );

  res.status(201).json(newMessage);
});

export const deleteMessage = catchAsync(async (req: AuthRequest, res: Response) => {
  validateRequest(req);
  if (!req.user?._id) throw new AppError('Unauthorized', 401);

  const { id: messageId } = req.params;
  await messageService.deleteUserMessage(req.user._id as string, messageId as string);

  res.status(200).json({ message: "Message deleted successfully" });
});

export const markMessageAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
  validateRequest(req);
  if (!req.user?._id) throw new AppError('Unauthorized', 401);

  const { id: messageId } = req.params;
  const { default: Message } = await import("../models/message.model.js");
  
  const message = await Message.findById(messageId);
  if (!message) throw new AppError("Message not found", 404);
  if (message.receiverId.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized", 403);
  }

  if (!message.isRead) {
    await message.markAsRead();
    const { getAllUserSockets, io } = await import("../lib/util/socket.js");
    const allSockets = new Set([...getAllUserSockets(message.receiverId.toString()), ...getAllUserSockets(message.senderId.toString())]);
    allSockets.forEach(socketId => {
      io.to(socketId).emit("messageRead", { messageId, readAt: message.readAt });
    });
  }

  res.status(200).json({ success: true, readAt: message.readAt });
});
