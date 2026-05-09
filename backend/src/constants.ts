/**
 * @fileoverview Centralized constants for the application.
 */

// Rate limiting constants
export const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
export const AUTH_ROUTES_LIMIT = 10;
export const MESSAGE_ROUTES_LIMIT = 100;

// Pagination/Query limits
export const SIDEBAR_USERS_LIMIT = 50;
export const MESSAGES_LIMIT = 100;

// Message constants
export const MAX_MESSAGE_LENGTH = 1000;

// File upload constants
export const IMAGE_UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024; // 10MB
export const CLOUDINARY_IMAGE_FOLDER = 'chatApp/images';
export const RESOURCE_TYPE_IMAGE = 'image';