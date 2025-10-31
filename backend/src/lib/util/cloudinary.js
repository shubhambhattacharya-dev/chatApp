import { v2 as cloudinary } from 'cloudinary';
import logger from './logger.js';

// Validate required environment variables
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

let isConfigured = false;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.warn(`⚠️ Missing environment variable: ${envVar}. Cloudinary features will be disabled.`);
    isConfigured = false;
    break;
  } else {
    isConfigured = true;
  }
}

if (isConfigured) {
  logger.info('✅ Cloudinary configuration loaded successfully');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  logger.warn('⚠️ Cloudinary not configured. Profile picture uploads will be disabled.');
}

export default cloudinary;
export { isConfigured as cloudinaryConfigured };
