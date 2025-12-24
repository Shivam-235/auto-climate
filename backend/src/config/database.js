const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI 
    console.log(mongoURI);
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Don't exit, allow app to run without DB in development
    console.log('Running without database - some features will be limited');
  }
};

module.exports = { connectDB, mongoose };
