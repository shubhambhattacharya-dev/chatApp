import mongoose from 'mongoose';
import logger from '../lib/util/logger.js';
import config from '../config.js';

const connectDB = async (retries = 5, delay = 1000): Promise<void> => {
  try {
    const dbURI = new URL(config.mongodb.uri);
    const dbName = dbURI.pathname.slice(1) || 'RealChat';

    // Ensure correct query parameters for modern MongoDB versions
    if (!dbURI.searchParams.has('retryWrites')) {
      dbURI.searchParams.set('retryWrites', 'true');
    }
    if (!dbURI.searchParams.has('w')) {
      dbURI.searchParams.set('w', 'majority');
    }
    
    const conn = await mongoose.connect(dbURI.toString(), {
      dbName,
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error: any) {
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
