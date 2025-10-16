const mongoose = require('mongoose');

const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next();
  } else {
    return res.status(503).json({ 
      error: 'Database is not available. Please check connection and try again.',
      message: 'The application is running but database connection failed. Please verify MongoDB credentials and network access.'
    });
  }
};

module.exports = {
  checkDatabaseConnection
};