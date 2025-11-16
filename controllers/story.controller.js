const Story = require('../models/Story');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { validationResult } = require('express-validator');

/**
 * Upload buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'telegram-stories',
        transformation: resourceType === 'image' ? [
          { width: 1080, height: 1920, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ] : []
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * @desc    Create a new story
 * @route   POST /api/stories/create
 * @access  Private
 */
exports.createStory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { type, textContent, caption, backgroundColor, visibility } = req.body;
// Defensive: always ensure duration exists and is a number!
let storyDuration = Number(req.body.duration);
if (!storyDuration || isNaN(storyDuration)) storyDuration = 24;
    const file = req.file;

    // Validate story type
    if (!['image', 'video', 'text'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid story type. Must be image, video, or text'
      });
    }

    let mediaUrl = null;
    let cloudinaryId = null;

    // Handle media upload for image/video stories
    if (type === 'image' || type === 'video') {
      if (!file) {
        return res.status(400).json({
          success: false,
          error: `File is required for ${type} story`
        });
      }

      try {
        const resourceType = type === 'video' ? 'video' : 'image';
        const uploadResult = await uploadToCloudinary(file.buffer, resourceType);
        mediaUrl = uploadResult.secure_url;
        cloudinaryId = uploadResult.public_id;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload media to Cloudinary'
        });
      }
    }

    // Handle text story
    if (type === 'text' && !textContent) {
      return res.status(400).json({
        success: false,
        error: 'Text content is required for text story'
      });
    }

    // Create story
   const story = await Story.create({
  userId: req.user._id,
  type,
  mediaUrl,
  cloudinaryId,
  textContent,
  caption,
  backgroundColor: backgroundColor || '#FFFFFF',
  duration: storyDuration,
  visibility: visibility || 'public'
});

    // Increment user's stories count
    await req.user.incrementStoriesCount();

    // Populate user data
    await story.populate('userId', 'username firstName lastName profilePhoto profileColor');

    res.status(201).json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating story'
    });
  }
};

/**
 * @desc    Get all active stories
 * @route   GET /api/stories
 * @access  Private
 */
exports.getStories = async (req, res) => {
  try {
    const { visibility, type, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {
      isExpired: false,
      expiresAt: { $gt: new Date() }
    };

    // Filter by visibility
    if (visibility && ['public', 'friends', 'private'].includes(visibility)) {
      query.visibility = visibility;
    } else {
      // Default: show public stories and user's own stories
      query.$or = [
        { visibility: 'public' },
        { userId: req.user._id }
      ];
    }

    // Filter by type
    if (type && ['image', 'video', 'text'].includes(type)) {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const stories = await Story.find(query)
      .populate('userId', 'username firstName lastName profilePhoto profileColor isPremium')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Story.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        stories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching stories'
    });
  }
};

/**
 * @desc    Get user's stories
 * @route   GET /api/stories/user/:userId
 * @access  Public
 */
exports.getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;

    const stories = await Story.find({
      userId,
      isExpired: false,
      expiresAt: { $gt: new Date() }
    })
      .populate('userId', 'username firstName lastName profilePhoto profileColor isPremium')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: stories
    });
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching user stories'
    });
  }
};

/**
 * @desc    Get single story
 * @route   GET /api/stories/:id
 * @access  Public
 */
exports.getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('userId', 'username firstName lastName profilePhoto profileColor isPremium')
      .populate('views.userId', 'username firstName lastName profilePhoto')
      .populate('likes.userId', 'username firstName lastName profilePhoto');

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    res.status(200).json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching story'
    });
  }
};

/**
 * @desc    Like a story
 * @route   POST /api/stories/:id/like
 * @access  Private
 */
exports.likeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    // Check if already liked
    const isLiked = story.isLikedBy(req.user._id);

    if (isLiked) {
      // Unlike
      await story.removeLike(req.user._id);
      return res.status(200).json({
        success: true,
        message: 'Story unliked',
        data: { likesCount: story.likesCount, isLiked: false }
      });
    } else {
      // Like
      await story.addLike(req.user._id);
      return res.status(200).json({
        success: true,
        message: 'Story liked',
        data: { likesCount: story.likesCount, isLiked: true }
      });
    }
  } catch (error) {
    console.error('Like story error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error liking story'
    });
  }
};

/**
 * @desc    Record story view
 * @route   POST /api/stories/:id/view
 * @access  Private
 */
exports.viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    await story.addView(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Story view recorded',
      data: { viewsCount: story.viewsCount }
    });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error recording view'
    });
  }
};

/**
 * @desc    Delete story
 * @route   DELETE /api/stories/:id
 * @access  Private (Owner only)
 */
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    // Check ownership
    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this story'
      });
    }

    // Delete from Cloudinary if media exists
    if (story.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(story.cloudinaryId, {
          resource_type: story.type === 'video' ? 'video' : 'image'
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue with DB deletion even if Cloudinary fails
      }
    }

    // Delete from database
    await Story.findByIdAndDelete(req.params.id);

    // Decrement user's stories count
    await req.user.decrementStoriesCount();

    res.status(200).json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error deleting story'
    });
  }
};

/**
 * @desc    Get story viewers
 * @route   GET /api/stories/:id/views
 * @access  Private (Owner only)
 */
exports.getStoryViewers = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('views.userId', 'username firstName lastName profilePhoto profileColor');

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    // Check ownership
    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view story viewers'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        viewsCount: story.viewsCount,
        views: story.views
      }
    });
  } catch (error) {
    console.error('Get story viewers error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching story viewers'
    });
  }
};
