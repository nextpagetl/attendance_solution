import dotenv from 'dotenv';
import mongoose from 'mongoose';
import startWebSocketServer from './services/websocket.js';
import Company from './models/Company.js';
import Device from './models/Device.js';
import Log from './models/Log.js';

dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI);

const initialize = async () => {
  if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI is not defined in .env file');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
    await startWebSocketServer();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

initialize();