const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createStory,
  getStories,
  getUserStories,
  getStory,
  likeStory,
  viewStory,
  deleteStory,
  getStoryViewers
} = require('../controllers/story.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload, handleMulterError } = require('../middleware/upload.middleware');

// Validation rules
const createStoryValidation = [
  body('type').isIn(['image', 'video', 'text']).withMessage('Invalid story type'),
  body('duration').optional().isInt({ min: 1, max: 168 }).withMessage('Duration must be between 1 and 168 hours'),
  body('visibility').optional().isIn(['public', 'friends', 'private']).withMessage('Invalid visibility option'),
  body('caption').optional().isLength({ max: 500 }).withMessage('Caption cannot exceed 500 characters')
];

// Routes
router.post('/create', protect, upload.single('file'), handleMulterError, createStoryValidation, createStory);
router.get('/', protect, getStories);
router.get('/user/:userId', getUserStories);
router.get('/:id', getStory);
router.post('/:id/like', protect, likeStory);
router.post('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);
router.get('/:id/views', protect, getStoryViewers);

module.exports = router;
