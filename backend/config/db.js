const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Load MONGO_URI from .env

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Continuing without MongoDB - some features may not work');
    // Don't exit, continue without DB for demo purposes
  }
};

module.exports = connectDB;
