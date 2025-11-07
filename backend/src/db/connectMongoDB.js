import mongoose from 'mongoose'
import logger from "../lib/util/logger.js";

const connectDB = async (retries = 5, delay = 1000) => {
    try {
        if (!process.env.MONGO_DB) {
            logger.fatal('FATAL ERROR: MONGO_DB environment variable is not set.');
            process.exit(1);
        }
        const conn = await mongoose.connect(process.env.MONGO_DB);
        logger.info(`MongoDB connected: ${conn.connection.host}`);

    } catch (error) {
        logger.error({ err: error }, `MongoDB connection error (attempt ${6 - retries}/5):`);
        if (retries > 0) {
            logger.info(`Retrying connection in ${delay}ms...`);
            setTimeout(() => connectDB(retries - 1, delay * 2), delay);
        } else {
            logger.fatal('Failed to connect to MongoDB after 5 attempts. Exiting.');
            process.exit(1);
        }
    }
};

export default connectDB;
