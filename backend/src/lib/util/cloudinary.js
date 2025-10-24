import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
// Note: dotenv is already configured in server.js, so no need to call config again
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;
