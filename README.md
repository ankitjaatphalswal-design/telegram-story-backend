# Telegram Story Backend

A complete Node.js backend server for a Telegram custom story feature with real-time story management, user authentication, media storage, and automatic expiration handling.

## 🚀 Features

- **User Authentication**: JWT-based authentication with Telegram integration
- **Story Management**: Create, view, like, and manage stories (image, video, text)
- **Media Storage**: Cloudinary integration for image/video uploads with auto-optimization
- **Real-time Views & Likes**: Track story views and likes with user details
- **Auto-Expiration**: Automatic story cleanup with cron jobs (runs every 6 hours)
- **Visibility Controls**: Public, friends, and private story visibility options
- **Production-Ready**: Railway/Heroku compatible with graceful shutdown handling

## 📦 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Media Storage**: Cloudinary
- **Validation**: Express-validator
- **Task Scheduling**: Node-cron
- **Security**: CORS, bcryptjs

## 📁 Project Structure

```
telegram-story-backend/
├── server.js                 # Main server entry point
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation
├── LICENSE                 # MIT License
├── config/
│   ├── database.js         # MongoDB connection config
│   └── cloudinary.js       # Cloudinary configuration
├── models/
│   ├── User.js            # User model schema
│   └── Story.js           # Story model schema
├── routes/
│   ├── auth.routes.js     # Authentication routes
│   ├── story.routes.js    # Story management routes
│   └── user.routes.js     # User profile routes
├── controllers/
│   ├── auth.controller.js  # Auth business logic
│   ├── story.controller.js # Story business logic
│   └── user.controller.js  # User business logic
└── middleware/
    ├── auth.middleware.js  # JWT authentication middleware
    └── upload.middleware.js # File upload middleware
```

## 🔧 Installation

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or cloud instance)
- Cloudinary account

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/telegram-story-backend.git
cd telegram-story-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/telegram_stories
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAX_FILE_SIZE=52428800
```

4. **Start the server**

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "telegramId": "123456789",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "profilePhoto": "https://example.com/photo.jpg",
  "profileColor": "#0088CC",
  "emojiStatus": "🎉",
  "isPremium": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60f7b...",
      "telegramId": "123456789",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "telegramId": "123456789"
  // OR
  "username": "johndoe"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <JWT_TOKEN>
```

### Story Endpoints

#### Create Story
```http
POST /api/stories/create
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Form Data:
- file: (binary) - Image or video file
- type: "image" | "video" | "text"
- textContent: "Story text" (required if type=text)
- caption: "Optional caption"
- backgroundColor: "#FFFFFF"
- duration: 24 (hours, 1-168)
- visibility: "public" | "friends" | "private"
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "60f7b...",
    "userId": {...},
    "type": "image",
    "mediaUrl": "https://res.cloudinary.com/...",
    "caption": "Beautiful sunset!",
    "viewsCount": 0,
    "likesCount": 0,
    "expiresAt": "2024-01-16T10:00:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### Get All Active Stories
```http
GET /api/stories?page=1&limit=20&type=image&visibility=public
Authorization: Bearer <JWT_TOKEN>
```

#### Get User Stories
```http
GET /api/stories/user/:userId
```

#### Get Single Story
```http
GET /api/stories/:storyId
```

#### Like/Unlike Story
```http
POST /api/stories/:storyId/like
Authorization: Bearer <JWT_TOKEN>
```

#### Record Story View
```http
POST /api/stories/:storyId/view
Authorization: Bearer <JWT_TOKEN>
```

#### Delete Story (Owner Only)
```http
DELETE /api/stories/:storyId
Authorization: Bearer <JWT_TOKEN>
```

#### Get Story Viewers (Owner Only)
```http
GET /api/stories/:storyId/views
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "viewsCount": 15,
    "views": [
      {
        "userId": {...},
        "viewedAt": "2024-01-15T11:30:00.000Z"
      }
    ]
  }
}
```

### User Endpoints

#### Get User by ID
```http
GET /api/users/:userId
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "profilePhoto": "https://example.com/new-photo.jpg",
  "profileColor": "#FF5733",
  "emojiStatus": "🔥"
}
```

### Health Check
```http
GET /health
```

## 🗄️ Database Models

### User Model
```javascript
{
  telegramId: String (unique, required),
  username: String (unique, required),
  firstName: String,
  lastName: String,
  phoneNumber: String,
  profilePhoto: String,
  profileColor: String (default: "#0088CC"),
  emojiStatus: String,
  isPremium: Boolean (default: false),
  storiesCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Story Model
```javascript
{
  userId: ObjectId (ref: User, required),
  type: String (enum: ['image', 'video', 'text'], required),
  mediaUrl: String,
  cloudinaryId: String,
  textContent: String,
  caption: String (max: 500 chars),
  backgroundColor: String (default: "#FFFFFF"),
  duration: Number (default: 24, min: 1, max: 168),
  visibility: String (enum: ['public', 'friends', 'private'], default: 'public'),
  views: [{ userId: ObjectId, viewedAt: Date }],
  likes: [{ userId: ObjectId, likedAt: Date }],
  expiresAt: Date (required, indexed),
  isExpired: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security

- JWT tokens expire after 7 days (configurable)
- Password hashing with bcryptjs
- Protected routes require valid JWT
- Owner-only deletion (users can only delete their own stories)
- Input validation and sanitization
- File type and size restrictions (max 50MB)
- CORS enabled (configure for production)

## ⏰ Automated Tasks

### Story Expiration Cron Job
- Runs every 6 hours
- Finds stories where `expiresAt < now`
- Deletes media from Cloudinary
- Marks stories as expired in database

## 🚀 Deployment

### Deploy to Railway

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

3. **Login and initialize**
```bash
railway login
railway init
```

4. **Add environment variables** in Railway dashboard

5. **Deploy**
```bash
railway up
```

### Deploy to Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login and create app**
```bash
heroku login
heroku create telegram-story-backend
```

3. **Set environment variables**
```bash
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
# ... set all other variables
```

4. **Deploy**
```bash
git push heroku main
```

## 🧪 Testing

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 123.456
}
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Run in production mode
npm start
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Node.js, Express, MongoDB, and Cloudinary**
