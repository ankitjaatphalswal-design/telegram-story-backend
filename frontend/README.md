# Telegram Mini App - Custom Stories Feature

A complete Telegram Mini App that provides Instagram-like stories functionality using Telegram's native UI and your custom backend server.

## ✨ Features

- **Native Telegram UI**: Uses Telegram's theme colors and design patterns
- **Story Types**: Support for Image, Video, and Text stories
- **Real-time Interactions**: Like, view count, and engagement tracking
- **Telegram Authentication**: Seamless login using Telegram user data
- **Your Backend**: Connects directly to your custom story backend
- **Responsive Design**: Works perfectly on all mobile devices
- **Auto-refresh**: Stories update automatically every 30 seconds

## 🚀 Quick Setup

### Prerequisites

1. ✅ Backend server deployed on Railway (from previous setup)
2. ✅ Telegram Bot created via @BotFather
3. ✅ Web hosting for the frontend (GitHub Pages, Netlify, or Vercel)

### Step 1: Create Telegram Bot

1. **Open Telegram** and search for **@BotFather**

2. **Create a new bot:**
   ```
   /newbot
   ```
   - Choose a name: `My Stories Bot`
   - Choose a username: `mystories_bot` (must end with 'bot')

3. **Save your bot token** (you'll need it later)

4. **Set up the Web App:**
   ```
   /newapp
   ```
   - Select your bot
   - Title: `Stories`
   - Description: `Share your moments with custom stories`
   - Photo: Upload a 640x360 image (optional)
   - Demo GIF: Optional
   - **Web App URL**: `https://your-github-username.github.io/telegram-story-backend/frontend/`
     (We'll set this up in Step 2)

### Step 2: Deploy Frontend to GitHub Pages

1. **Update API URL** in `app.js`:
   ```javascript
   const API_BASE_URL = 'https://your-railway-app.up.railway.app/api';
   ```
   Replace with your actual Railway URL.

2. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages"
   - Source: Deploy from branch
   - Branch: `main`
   - Folder: `/ (root)`
   - Save

3. **Your app will be available at:**
   ```
   https://your-username.github.io/telegram-story-backend/frontend/
   ```

4. **Update @BotFather** with this URL:
   ```
   /myapps
   ```
   Select your app → Edit → Web App URL → Paste your GitHub Pages URL

### Step 3: Configure CORS on Backend

Update your backend's `server.js` to allow your frontend domain:

```javascript
const cors = require('cors');

app.use(cors({
    origin: [
        'https://your-username.github.io',
        'https://web.telegram.org'
    ],
    credentials: true
}));
```

Redeploy your backend after this change.

### Step 4: Test Your Mini App

1. Open your bot in Telegram
2. Click the **Menu** button or type any command
3. Your Mini App should open!

## 📱 How to Use

### For Users:

**Opening the App:**
1. Search for your bot in Telegram
2. Start the bot
3. Click "Open Stories" or the menu button

**Creating a Story:**
1. Click the "Create Story" button
2. Choose story type (Image/Video/Text)
3. Upload media or write text
4. Add optional caption
5. Select visibility (Public/Friends/Private)
6. Click "Publish Story"

**Viewing Stories:**
1. Tap any story card to view
2. Like stories by tapping the heart icon
3. See view counts
4. Swipe or tap X to close

### For Developers:

**File Structure:**
```
frontend/
├── index.html      # Main HTML with UI structure
├── styles.css      # Telegram-themed styles
├── app.js          # Core app logic & API integration
└── README.md       # This file
```

**API Integration:**
The app connects to your backend endpoints:
- `POST /api/auth/register` - Auto-register users
- `POST /api/auth/login` - Authenticate users
- `GET /api/stories` - Fetch all stories
- `POST /api/stories/create` - Create new story
- `POST /api/stories/:id/like` - Like/unlike story
- `POST /api/stories/:id/view` - Record view

**Telegram WebApp SDK:**
```javascript
const tg = window.Telegram.WebApp;
tg.ready();        // Initialize
tg.expand();       // Fullscreen
tg.MainButton      // Bottom button
tg.HapticFeedback  // Vibration
```

## 🎨 Customization

### Change Theme Colors:

Edit CSS variables in `styles.css`:
```css
:root {
    --tg-theme-bg-color: #ffffff;
    --tg-theme-text-color: #000000;
    --tg-theme-button-color: #2481cc;
}
```

### Modify Story Layout:

Edit the grid in `styles.css`:
```css
.stories-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
}
```

### Add New Features:

1. Edit HTML structure in `index.html`
2. Add styles in `styles.css`
3. Implement logic in `app.js`

## 🔧 Deployment Options

### Option 1: GitHub Pages (Free, Recommended)
✅ Free hosting
✅ HTTPS by default
✅ Easy updates via git push
✅ Custom domain support

### Option 2: Netlify
✅ Drag-and-drop deployment
✅ Automatic builds
✅ Free SSL
✅ Fast CDN

### Option 3: Vercel
✅ Zero config
✅ Automatic deployments
✅ Preview deployments
✅ Analytics

### Option 4: Cloudflare Pages
✅ Free and unlimited
✅ Global CDN
✅ Built-in analytics

## 🐛 Troubleshooting

**Issue: "Unable to get user data"**
- Make sure you're opening via Telegram (not browser directly)
- Check bot is created via @BotFather

**Issue: "Authentication failed"**
- Verify backend URL in `app.js`
- Check backend is running and accessible
- Verify CORS is configured correctly

**Issue: "Failed to load stories"**
- Check browser console for errors
- Verify API endpoints are correct
- Ensure backend is deployed

**Issue: "File upload fails"**
- Check file size (max 50MB)
- Verify Cloudinary is configured on backend
- Check file type is allowed

## 📝 Environment Variables

**Frontend (in app.js):**
```javascript
const API_BASE_URL = 'YOUR_BACKEND_URL/api';
```

**Backend (.env):**
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🔐 Security

- ✅ JWT token authentication
- ✅ Telegram user verification
- ✅ CORS protection
- ✅ File type validation
- ✅ Size limits enforced

## 📚 Resources

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram WebApp SDK](https://core.telegram.org/bots/webapps#initializing-mini-apps)
- [Backend API Documentation](../README.md)

## 🎉 Success!

Your Telegram Mini App with custom stories is now live! Users can:
- ✅ Create stories directly in Telegram
- ✅ View friends' stories
- ✅ Like and interact
- ✅ All data stored on YOUR backend

---

**Built with ❤️ using Telegram Mini Apps, Vanilla JavaScript, and Your Custom Backend**
