import mongoose from 'mongoose'

const connectDB=async()=>{
    try {
        const conn=await mongoose.connect(process.env.mongo_db);
        console.log(`MongoDB connected:${conn.connection.host}`);
        
    } catch (error) {
        
    }
}