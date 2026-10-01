/**
 * @file db.config.js
 * @module config/dbConfig
 * @description MongoDB configuration for the WhiteBear backend application.
 */

const mongoose = require('mongoose');

// Assuming you have an env config file or use process.env directly
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV;

exports.connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }

    if (NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }

    const options = {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log(
      `🔌 MongoDB Connected Successfully! Host: ${mongoose.connection.host}`
    );
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Only exit in local dev, Vercel will retry on next invocation
  }
};

// 3. Monitor connection lifecycles
mongoose.connection.on('error', (err) => {
  console.error(`⚠️ MongoDB runtime error: ${err}`);
});

exports.monitorConnection = () => {
  mongoose.connection.on('error', (err) => {
    console.error(`⚠️ MongoDB runtime error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection lost. Attempting to reconnect...');
  });
};

// 4. Handle Graceful Shutdown
// Ensures DB connections close cleanly when the Node process terminates (prevents ghost connections)
exports.closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('📉 MongoDB connection closed through app termination.');
  } catch (err) {
    console.error(`Error closing MongoDB connection: ${err}`);
  }
};
