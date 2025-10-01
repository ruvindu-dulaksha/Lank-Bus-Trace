import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bus_tracking_db';
    
    const options = {
      // Remove deprecated options
      // useNewUrlParser and useUnifiedTopology are now default
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
    };

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info('🔌 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('🔌 Mongoose connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;