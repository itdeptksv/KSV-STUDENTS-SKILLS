const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.LOCAL_MODE === 'true' || process.env.DEMO_MODE === 'true') {
    console.log('Local mode enabled: skipping MongoDB connection');
    return null;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set: falling back to Local Mode');
    return null;
  }
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`MongoDB unavailable (${err.message}): running in Local Mode without MongoDB`);
    return null;
  }
};

module.exports = connectDB;
