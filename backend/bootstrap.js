import dotenv from "dotenv";

dotenv.config();

// Override NODE_ENV for development
process.env.NODE_ENV = 'development';

// Dynamically import the main server file after dotenv is configured
import './src/server.js';
