# FreeCaRM - Deployment Guide

## 🚀 Quick Start

FreeCaRM is ready to deploy! The application consists of:
- **Backend API** (Node.js/Express/TypeScript) - Built and ready ✅
- **Mobile App** (React Native/Expo) - Ready for development ✅
- **Claude AI Integration** - Configured and ready ✅

## Prerequisites

### Required:
- **Node.js** 18+ and npm
- **MongoDB** 7+ (Local or Cloud)

### Optional:
- **Anthropic API Key** (for AI damage detection)
- **Docker** (for containerized deployment)

---

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create Free Account**: https://www.mongodb.com/cloud/atlas/register

2. **Create Cluster**:
   - Choose FREE tier (M0)
   - Select region closest to you
   - Click "Create Cluster"

3. **Setup Database Access**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `admin`
   - Password: Generate secure password
   - Database User Privileges: "Read and write to any database"

4. **Setup Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) - for development
   - For production, use specific IP addresses

5. **Get Connection String**:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password

6. **Update `.env`**:
   ```bash
   cd backend
   nano .env  # or vim, or any editor

   # Update this line:
   MONGODB_URI=mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/freecarm?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB Installation

#### Ubuntu/Debian:
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify it's running
sudo systemctl status mongod
```

#### macOS:
```bash
# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0

# Verify it's running
brew services list | grep mongodb
```

#### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Start MongoDB service from Services panel

### Option 3: Docker (Quick Start)

```bash
# Run MongoDB in Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7

# Update .env file
MONGODB_URI=mongodb://admin:admin123@localhost:27017/freecarm?authSource=admin
```

---

## 🔧 Backend Deployment

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your settings
nano .env
```

**Required settings:**
```env
PORT=3000
NODE_ENV=production

# MongoDB (choose one option from above)
MONGODB_URI=mongodb://localhost:27017/freecarm

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Optional: Claude AI API Key
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Step 3: Build Application
```bash
npm run build
```

### Step 4: Start Server
```bash
# Production mode
npm start

# OR Development mode with auto-reload
npm run dev
```

**Server will start on:** http://localhost:3000

### Step 5: Verify Server is Running
```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"OK","timestamp":"2024-01-XX..."}
```

---

## 📱 Mobile App Setup

### Step 1: Install Dependencies
```bash
cd mobile
npm install
```

### Step 2: Configure API URL

Edit `mobile/src/config/api.ts`:

```typescript
// For local development
export const API_BASE_URL = 'http://localhost:3000/api';

// For iOS Simulator
// export const API_BASE_URL = 'http://localhost:3000/api';

// For Android Emulator
// export const API_BASE_URL = 'http://10.0.2.2:3000/api';

// For Physical Device (replace with your IP)
// export const API_BASE_URL = 'http://192.168.1.XXX:3000/api';

// For Production
// export const API_BASE_URL = 'https://your-domain.com/api';
```

### Step 3: Start Expo
```bash
npm start
```

### Step 4: Run on Device

**Option A: Expo Go App**
1. Install "Expo Go" app on your phone (iOS/Android)
2. Scan QR code displayed in terminal
3. App will load on your device

**Option B: iOS Simulator** (macOS only)
```bash
npm run ios
```

**Option C: Android Emulator**
```bash
npm run android
```

---

## 🤖 Claude AI Setup (Optional but Recommended)

### Step 1: Get API Key

1. Go to: https://console.anthropic.com/
2. Sign up/Sign in
3. Go to "API Keys"
4. Create new key
5. Copy the key (starts with `sk-ant-api03-...`)

### Step 2: Configure in App

**Option A: Backend Environment Variable**
```bash
# In backend/.env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Option B: Per-User Configuration** (Recommended)
1. Open mobile app
2. Go to **Profile** → **Settings**
3. Enter your Claude API key
4. Click **Save API Key**
5. Click **Test Connection** to verify

**Benefits:**
- 🎯 More accurate damage detection
- 📝 Detailed descriptions in multiple languages
- 🔍 Better severity assessment
- ⚡ Faster processing

---

## 🐳 Docker Deployment

### Quick Deploy with Docker Compose

```bash
# From project root
docker-compose up -d

# This starts:
# - MongoDB on port 27017
# - Backend API on port 3000
```

### Manual Docker Build

```bash
# Build backend image
docker build -t freecarm-backend .

# Run with environment variables
docker run -d \
  --name freecarm-api \
  -p 3000:3000 \
  -e MONGODB_URI="mongodb://host.docker.internal:27017/freecarm" \
  -e JWT_SECRET="your-secret-key" \
  freecarm-backend
```

---

## 🌐 Production Deployment

### Backend Deployment Options

**1. Cloud Platforms:**

#### Heroku
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-secret"
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

#### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/freecarm
gcloud run deploy freecarm --image gcr.io/PROJECT_ID/freecarm --platform managed
```

#### AWS Elastic Beanstalk
```bash
# Initialize EB
eb init -p node.js-18 freecarm

# Create environment
eb create freecarm-prod

# Deploy
eb deploy
```

**2. VPS/Dedicated Server:**

```bash
# Install Node.js, MongoDB
# Clone repository
git clone https://github.com/yourusername/FreeCaRM.git
cd FreeCaRM/backend

# Install dependencies and build
npm install
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name freecarm-api
pm2 save
pm2 startup
```

**3. Nginx Reverse Proxy:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Mobile App Deployment

#### iOS (App Store)

```bash
cd mobile

# Build for iOS
expo build:ios

# Follow Expo instructions to submit to App Store
```

#### Android (Google Play)

```bash
cd mobile

# Build APK/AAB
expo build:android

# Upload to Google Play Console
```

---

## ✅ Testing

### Backend API Tests

```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "firstName": "Test",
    "lastName": "User"
  }'

# Expected: Returns token and user info
```

### Mobile App Tests

1. **Register** new account
2. **Create** new inspection with vehicle info
3. **Take photos** from multiple angles
4. **Analyze** damages (uses Claude AI if configured)
5. **View** detected damages and cost estimates
6. **Generate** PDF report

---

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
1. Verify MongoDB is running: `systemctl status mongod` (Linux)
2. Check connection string in `.env`
3. Verify network access (for MongoDB Atlas)
4. Try connecting with mongo shell: `mongosh "your-connection-string"`

### Backend Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Mobile App Can't Connect to API

**Solutions:**
1. Verify backend is running: `curl http://localhost:3000/health`
2. Update API_BASE_URL in `mobile/src/config/api.ts`
3. For physical device, use your computer's IP address
4. Check firewall settings

### Claude API Errors

**Error:** `Invalid API key`

**Solutions:**
1. Verify API key is correct
2. Check you have credits: https://console.anthropic.com/
3. Test key independently
4. App will fallback to mock detection if key is invalid

---

## 📊 Monitoring

### View Backend Logs

```bash
# With PM2
pm2 logs freecarm-api

# With Docker
docker logs -f freecarm-backend

# Direct node process
npm start
```

### Database Statistics

```bash
# Connect to MongoDB
mongosh "your-connection-string"

# Check databases
show dbs

# Use freecarm database
use freecarm

# View collections
show collections

# Count documents
db.inspections.count()
db.users.count()
```

---

## 🔐 Security Best Practices

1. **Change default secrets** in `.env`
2. **Use HTTPS** in production
3. **Enable CORS** only for your domains
4. **Regular updates** of dependencies
5. **Secure MongoDB** with authentication
6. **Use environment variables** for sensitive data
7. **Enable rate limiting** for API endpoints
8. **Regular backups** of database

---

## 📞 Support

- **Documentation**: See main README.md
- **Issues**: https://github.com/yourusername/FreeCaRM/issues
- **API Docs**: http://localhost:3000/api-docs (when running)

---

**🎉 Your FreeCaRM application is now ready for production!**
