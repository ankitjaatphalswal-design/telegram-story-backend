const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: [true, 'Telegram ID is required'],
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  profilePhoto: {
    type: String,
    default: null
  },
  profileColor: {
    type: String,
    default: '#0088CC'
  },
  emojiStatus: {
    type: String,
    default: null
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  storiesCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
});

// Method to increment stories count
userSchema.methods.incrementStoriesCount = async function() {
  this.storiesCount += 1;
  return await this.save();
};

// Method to decrement stories count
userSchema.methods.decrementStoriesCount = async function() {
  if (this.storiesCount > 0) {
    this.storiesCount -= 1;
    return await this.save();
  }
  return this;
};

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
