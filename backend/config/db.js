import mongoose from 'mongoose';

/**
 * config/db.js
 * Establishes MongoDB Atlas connection using Mongoose.
 * Uses connection events for robust logging.
 * Called once at server startup.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are defaults in Mongoose 7+ but explicit for clarity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Kill the process if DB can't connect
  }
};

export default connectDB;
