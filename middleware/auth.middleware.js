const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to allow any user, with or without a JWT token
 */
const protect = async (req, res, next) => {
  // Optionally, set a default user (so req.user is never undefined)
  req.user = { _id: '000000000000000000000001', username: 'publicuser' };
  // Optionally, just log if a token header was present
  // console.log('Authorization:', req.headers.authorization);

  return next(); // Allow all requests through!
};
/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = { protect, generateToken };
