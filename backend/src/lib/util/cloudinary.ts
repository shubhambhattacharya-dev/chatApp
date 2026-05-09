import { v2 as cloudinary } from 'cloudinary';
import config from '../../config.js';
import logger from './logger.js';

let cloudinaryConfigured = false;

try {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
  cloudinaryConfigured = true;
} catch (error: any) {
  logger.error({ err: error }, 'Cloudinary configuration error');
}

export { cloudinaryConfigured };
export default cloudinary;
