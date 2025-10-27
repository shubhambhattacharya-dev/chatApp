import mongoose from 'mongoose'

const connectDB=async()=>{
    try {
        if (!process.env.MONGO_DB) {
            console.error('FATAL ERROR: MONGO_DB environment variable is not set.');
            process.exit(1);
        }
        const conn=await mongoose.connect(process.env.MONGO_DB);
        console.log(`MongoDB connected:${conn.connection.host}`); 
        
    } catch (error) {
        console.log('MongoDB connection error:',error);
        process.exit(1);
        
    }

}

export default connectDB;