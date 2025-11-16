const express = require('express');
const router = express.Router();
const { getUser, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// Routes
router.get('/:id', getUser);
router.put('/profile', protect, updateProfile);

module.exports = router;
