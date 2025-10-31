import multer from 'multer';
import path from 'path';
import logger from '../lib/util/logger.js';

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be temporarily stored in the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Middleware for single image upload
export const uploadSingleImage = (fieldName) => (req, res, next) => {
  const uploadMiddleware = upload.single(fieldName);

  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      logger.error({ err }, 'Multer error during file upload');
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      logger.error({ err }, 'Unknown error during file upload');
      return res.status(500).json({ success: false, message: err.message });
    }
    next();
  });
};

// Ensure the 'uploads/' directory exists
import fs from 'fs';
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  logger.info(`Created directory: ${uploadsDir}`);
}
