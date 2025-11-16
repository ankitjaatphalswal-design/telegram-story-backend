const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'text'],
    required: [true, 'Story type is required']
  },
  mediaUrl: {
    type: String,
    default: null
  },
  cloudinaryId: {
    type: String,
    default: null
  },
  textContent: {
    type: String,
    default: null
  },
  caption: {
    type: String,
    maxlength: [500, 'Caption cannot exceed 500 characters']
  },
  backgroundColor: {
    type: String,
    default: '#FFFFFF'
  },
  duration: {
    type: Number,
    default: 24,
    min: 1,
    max: 168 // Max 7 days
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  views: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isExpired: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// TTL index - MongoDB will automatically delete documents after expiration
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to set expiresAt
storySchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    const now = new Date();
    this.expiresAt = new Date(now.getTime() + this.duration * 60 * 60 * 1000);
  }
  next();
});

// Virtual for views count
storySchema.virtual('viewsCount').get(function() {
  return this.views.length;
});

// Virtual for likes count
storySchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Method to add a view
storySchema.methods.addView = async function(userId) {
  // Check if user already viewed
  const hasViewed = this.views.some(view => view.userId.toString() === userId.toString());

  if (!hasViewed) {
    this.views.push({ userId, viewedAt: new Date() });
    return await this.save();
  }

  return this;
};

// Method to add a like
storySchema.methods.addLike = async function(userId) {
  // Check if user already liked
  const hasLiked = this.likes.some(like => like.userId.toString() === userId.toString());

  if (!hasLiked) {
    this.likes.push({ userId, likedAt: new Date() });
    return await this.save();
  }

  return this;
};

// Method to remove a like
storySchema.methods.removeLike = async function(userId) {
  this.likes = this.likes.filter(like => like.userId.toString() !== userId.toString());
  return await this.save();
};

// Method to check if user liked
storySchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.userId.toString() === userId.toString());
};

// Ensure virtuals are included when converting to JSON
storySchema.set('toJSON', { virtuals: true });
storySchema.set('toObject', { virtuals: true });

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
