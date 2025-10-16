const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not defined');
    console.error('Please add MONGODB_URI to your .env file');
    return null;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Note: Application will continue running. Please verify your MongoDB credentials and network access.');
    console.log('Please ensure the database user has proper permissions and IP whitelist is configured.');
    return null;
  }
};

module.exports = connectDB;