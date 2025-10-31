import mongoose from 'mongoose'
import logger from "../lib/util/logger.js";

const connectDB=async()=>{
    try {
        if (!process.env.MONGO_DB) {
            logger.fatal('FATAL ERROR: MONGO_DB environment variable is not set.');
            process.exit(1);
        }
        const conn=await mongoose.connect(process.env.MONGO_DB);
        logger.info(`MongoDB connected:${conn.connection.host}`); 
        
    } catch (error) {
        logger.fatal({ err: error }, 'MongoDB connection error:');
        process.exit(1);
        
    }

}

export default connectDB;