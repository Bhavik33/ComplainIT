const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async (customUri = null) => {
  try {
    const connUri = customUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/resolveit';
    const conn = await mongoose.connect(connUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    // In test environment, don't exit process
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
