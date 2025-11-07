
import { param, body } from 'express-validator';

export const getMessagesBetweenUsersValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

export const sendMessageValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('message').optional().trim().notEmpty().withMessage('Message cannot be empty'),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
];

export const deleteMessageValidation = [
  param('id').isMongoId().withMessage('Invalid message ID'),
];
