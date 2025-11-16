const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter to only accept images and videos
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;

  // Check extension
  const extname = path.extname(file.originalname).toLowerCase().slice(1);

  // Check mime type
  const mimetype = file.mimetype;

  if (mimetype.startsWith('image/') && allowedImageTypes.test(extname)) {
    return cb(null, true);
  } else if (mimetype.startsWith('video/') && allowedVideoTypes.test(extname)) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV, AVI, MKV, WebM) are allowed.'));
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 // 50MB default
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File too large. Maximum size is ${(parseInt(process.env.MAX_FILE_SIZE) || 52428800) / (1024 * 1024)}MB`
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next();
};

module.exports = { upload, handleMulterError };
