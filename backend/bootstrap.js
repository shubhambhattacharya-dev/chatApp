import dotenv from "dotenv";

dotenv.config();

// Dynamically import the main server file after dotenv is configured
import './src/server.js';
