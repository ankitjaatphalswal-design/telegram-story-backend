const User = require('../models/User');

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');

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
        profilePhoto: user.profilePhoto,
        profileColor: user.profileColor,
        emojiStatus: user.emojiStatus,
        isPremium: user.isPremium,
        storiesCount: user.storiesCount,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching user'
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, profilePhoto, profileColor, emojiStatus } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (profileColor !== undefined) user.profileColor = profileColor;
    if (emojiStatus !== undefined) user.emojiStatus = emojiStatus;

    await user.save();

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
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating profile'
    });
  }
};
