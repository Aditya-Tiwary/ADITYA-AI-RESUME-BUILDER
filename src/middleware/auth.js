const jwt = require('jsonwebtoken');
const User = require('../database/models/User');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined');
  console.error('Please add JWT_SECRET to your .env file');
  process.exit(1);
}

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const authenticateToken = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    let tokenSource = 'cookie';
    
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
      tokenSource = 'header';
    }
    
    console.log('Auth middleware - checking token:', !!token, 'from', tokenSource);
    
    if (!token) {
      console.log('Auth middleware - No token found in cookies or headers');
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth middleware - token decoded for user:', decoded.userId, 'from', tokenSource);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('Auth middleware - User not found for token');
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    console.log('Auth middleware - authenticated user:', user.username, 'via', tokenSource);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth
};