const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Validation rules
const registerValidation = [
  body('telegramId').notEmpty().withMessage('Telegram ID is required'),
  body('username').notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
];

const loginValidation = [
  body('telegramId').optional().notEmpty().withMessage('Telegram ID cannot be empty'),
  body('username').optional().notEmpty().withMessage('Username cannot be empty')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', protect, getProfile);

module.exports = router;
