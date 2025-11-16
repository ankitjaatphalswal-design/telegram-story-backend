const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
require('dotenv').config();
console.log("CLOUDINARY ENV:", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);
const connectDB = require('./config/database');
const cron = require('node-cron');
const Story = require('./models/Story');
const cloudinary = require('./config/cloudinary');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/stories', require('./routes/story.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Cron job to delete expired stories (runs every 6 hours)
cron.schedule('0 */6 * * *', async () => {
  try {
    console.log(`[${new Date().toISOString()}] Running cron job to delete expired stories...`);

    const expiredStories = await Story.find({
      expiresAt: { $lt: new Date() },
      isExpired: false
    });

    for (const story of expiredStories) {
      // Delete from Cloudinary if media exists
      if (story.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(story.cloudinaryId, {
            resource_type: story.type === 'video' ? 'video' : 'image'
          });
          console.log(`Deleted media from Cloudinary: ${story.cloudinaryId}`);
        } catch (error) {
          console.error(`Failed to delete from Cloudinary: ${error.message}`);
        }
      }

      // Mark as expired
      story.isExpired = true;
      await story.save();
    }

    console.log(`Marked ${expiredStories.length} stories as expired`);
  } catch (error) {
    console.error('Cron job error:', error.message);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
