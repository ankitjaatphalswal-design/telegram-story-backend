const User = require('../models/User');
const { generateToken } = require('../middleware/auth.middleware');
const { validationResult } = require('express-validator');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { telegramId, username, firstName, lastName, phoneNumber, profilePhoto, profileColor, emojiStatus, isPremium } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ telegramId }, { username }] });

    if (user) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this Telegram ID or username'
      });
    }

    // Create new user
    user = await User.create({
      telegramId,
      username,
      firstName,
      lastName,
      phoneNumber,
      profilePhoto,
      profileColor: profileColor || '#0088CC',
      emojiStatus,
      isPremium: isPremium || false
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          profilePhoto: user.profilePhoto,
          profileColor: user.profileColor,
          emojiStatus: user.emojiStatus,
          isPremium: user.isPremium,
          storiesCount: user.storiesCount,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error registering user'
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { telegramId, username } = req.body;

    // Validate input
    if (!telegramId && !username) {
      return res.status(400).json({
        success: false,
        error: 'Please provide telegramId or username'
      });
    }

    // Find user
    const query = telegramId ? { telegramId } : { username };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          profilePhoto: user.profilePhoto,
          profileColor: user.profileColor,
          emojiStatus: user.emojiStatus,
          isPremium: user.isPremium,
          storiesCount: user.storiesCount,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error logging in'
    });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        profilePhoto: user.profilePhoto,
        profileColor: user.profileColor,
        emojiStatus: user.emojiStatus,
        isPremium: user.isPremium,
        storiesCount: user.storiesCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching profile'
    });
  }
};
