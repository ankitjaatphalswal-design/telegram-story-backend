# Railway Deployment Guide

## Quick Deploy to Railway

### Method 1: One-Click Deploy (Recommended)

1. **Fork or use this repository**

2. **Go to Railway**
   - Visit [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose `telegram-story-backend`

3. **Railway will automatically:**
   - Detect Node.js project
   - Install dependencies
   - Deploy your application

### Method 2: Railway CLI

#### Step 1: Install Railway CLI

**macOS/Linux:**
```bash
curl -fsSL https://railway.app/install.sh | sh
```

**Windows (PowerShell):**
```powershell
iwr https://railway.app/install.ps1 | iex
```

**Or via npm:**
```bash
npm install -g @railway/cli
```

#### Step 2: Login to Railway
```bash
railway login
```

This will open your browser to authenticate.

#### Step 3: Initialize Project
```bash
cd telegram-story-backend
railway init
```

Select "Create new project" and give it a name (e.g., "telegram-story-backend").

#### Step 4: Add MongoDB Database

**Option A: Using Railway's MongoDB Plugin**
```bash
railway add
```
Select "MongoDB" from the list. Railway will automatically:
- Provision a MongoDB instance
- Set the `MONGODB_URI` environment variable

**Option B: Use MongoDB Atlas (Free)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Add it to Railway (see Step 5)

#### Step 5: Set Environment Variables

**Via Railway CLI:**
```bash
railway variables set JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
railway variables set JWT_EXPIRE="7d"
railway variables set CLOUDINARY_CLOUD_NAME="your_cloud_name"
railway variables set CLOUDINARY_API_KEY="your_api_key"
railway variables set CLOUDINARY_API_SECRET="your_api_secret"
railway variables set MAX_FILE_SIZE="52428800"
railway variables set NODE_ENV="production"
```

**Or via Railway Dashboard:**
1. Go to your project on Railway dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add each variable:
   - `MONGODB_URI` - (Auto-set if using Railway MongoDB, or paste your MongoDB Atlas URI)
   - `JWT_SECRET` - `your-super-secret-jwt-key-change-this`
   - `JWT_EXPIRE` - `7d`
   - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
   - `MAX_FILE_SIZE` - `52428800` (50MB)
   - `NODE_ENV` - `production`

**Note:** The `PORT` variable is automatically set by Railway.

#### Step 6: Deploy
```bash
railway up
```

Railway will:
1. Build your application
2. Install dependencies
3. Start the server
4. Provide you with a public URL

#### Step 7: Get Your URL
```bash
railway domain
```

Or generate a domain:
```bash
railway domain create
```

Your app will be available at: `https://your-app-name.up.railway.app`

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/telegram_stories` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key-min-32-chars` |
| `JWT_EXPIRE` | JWT token expiration | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_secret_key` |
| `MAX_FILE_SIZE` | Max file upload size in bytes | `52428800` (50MB) |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (auto-set by Railway) | `3000` |

## Setting Up Cloudinary

1. **Create Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free (25GB storage, 25GB bandwidth/month)

2. **Get Credentials**
   - Go to Dashboard
   - Copy:
     - Cloud Name
     - API Key
     - API Secret

3. **Add to Railway**
   - Add these as environment variables in Railway

## Verify Deployment

### Test Health Endpoint
```bash
curl https://your-app-name.up.railway.app/health
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

### Test API Endpoints

**Register a user:**
```bash
curl -X POST https://your-app-name.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Railway Dashboard Features

### View Logs
```bash
railway logs
```

Or in the dashboard: Click on your service → "Deployments" → Click latest deployment → "View Logs"

### Monitor Metrics
In Railway dashboard:
- CPU usage
- Memory usage
- Network traffic
- Deployment history

### Custom Domain (Optional)

1. Go to your service settings
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as shown

## Troubleshooting

### Check Logs
```bash
railway logs
```

### Common Issues

**Issue: "Module not found"**
```bash
# Clear cache and redeploy
railway up --force
```

**Issue: "MongoDB connection failed"**
- Verify `MONGODB_URI` is correctly set
- Check MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)

**Issue: "Port already in use"**
- Railway automatically sets PORT, don't hardcode it
- Ensure server.js uses `process.env.PORT`

**Issue: "Cloudinary upload failed"**
- Verify all Cloudinary credentials are correct
- Check Cloudinary dashboard for usage limits

### Restart Service
```bash
railway restart
```

### Redeploy
```bash
railway up
```

## Scaling

Railway automatically handles:
- Load balancing
- Auto-scaling based on traffic
- Zero-downtime deployments

### Upgrade Plan (Optional)
Free tier includes:
- $5 free credit/month
- 512MB RAM
- Shared CPU

For production with high traffic, consider upgrading.

## Continuous Deployment

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway detects the push and deploys automatically.

## Database Backup (Important!)

### Using Railway MongoDB
Railway doesn't auto-backup on free tier. Consider:
- Upgrading to paid plan with backups
- Using MongoDB Atlas with auto-backups

### Using MongoDB Atlas
- Automatic backups enabled
- Point-in-time recovery
- Download backups anytime

## Monitoring & Alerts

Set up monitoring:
1. Railway dashboard → Service → "Observability"
2. View metrics, logs, and traces
3. Set up alerts for downtime

## Cost Estimation

**Free Tier:**
- $5 free credit/month
- Suitable for development/testing
- ~100 hours of runtime

**Paid (if needed):**
- Pay only for what you use
- ~$5-20/month for small apps
- Scale up as needed

## Support

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)

## Next Steps After Deployment

1. ✅ Test all API endpoints
2. ✅ Monitor logs for errors
3. ✅ Set up MongoDB backups
4. ✅ Configure custom domain (optional)
5. ✅ Set up monitoring alerts
6. ✅ Share API URL with frontend team

---

**Your app is now live! 🚀**

Access it at: `https://your-app-name.up.railway.app`
