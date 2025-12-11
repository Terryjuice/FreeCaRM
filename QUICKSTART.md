# 🚀 FreeCaRM Quick Start

## ✅ Current Status:
- Backend: **Built successfully** ✅
- Dependencies: **Installed** ✅
- MongoDB: **Needs setup** ⏳

---

## Choose MongoDB Setup:

### ⚡ Option 1: MongoDB Atlas (FASTEST - Recommended)

**Time:** 3-5 minutes | **Cost:** FREE

1. **Create account**: https://www.mongodb.com/cloud/atlas/register

2. **Create cluster:**
   - Click "Build a Database"
   - Choose **FREE** (M0 tier)
   - Select region (any)
   - Click "Create"

3. **Setup access:**
   - **Database Access**: Add user
     - Username: `admin`
     - Password: (generate & save it)
     - Role: "Read and write to any database"

   - **Network Access**: Add IP
     - Click "Add IP Address"
     - Select "Allow access from anywhere" (0.0.0.0/0)

4. **Get connection string:**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Example: `mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/freecarm`

5. **Update .env:**
   ```bash
   cd /home/user/FreeCaRM/backend
   nano .env

   # Replace this line:
   MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/freecarm
   ```

6. **Start server:**
   ```bash
   npm start
   ```

✅ **Done!** Backend running on http://localhost:3000

---

### 💻 Option 2: Local MongoDB

**Time:** 5-10 minutes | **Requires:** sudo access

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod
```

**Start backend:**
```bash
cd /home/user/FreeCaRM/backend
npm start
```

---

### 🐳 Option 3: Docker MongoDB

**Time:** 1 minute | **Requires:** Docker installed

```bash
# Run MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7

# Update .env
cd /home/user/FreeCaRM/backend
nano .env

# Change to:
MONGODB_URI=mongodb://admin:admin123@localhost:27017/freecarm?authSource=admin

# Start server
npm start
```

---

## 📱 Start Mobile App

After backend is running:

```bash
cd /home/user/FreeCaRM/mobile
npm install
npm start
```

Then:
- **Scan QR code** with Expo Go app
- Or press **'i'** for iOS simulator
- Or press **'a'** for Android emulator

---

## 🧪 Test Backend

```bash
# Health check
curl http://localhost:3000/health

# Should return:
# {"status":"OK","timestamp":"2024-XX-XX..."}

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "firstName": "Test",
    "lastName": "User"
  }'

# Should return token and user info
```

---

## 🎯 Next Steps After Starting:

1. **Register** account in mobile app
2. **Profile → Settings** - Add Claude API key (optional)
3. **Create inspection** - Add vehicle info
4. **Take photos** - Multiple angles
5. **Analyze** - AI detection
6. **View report** - PDF generation

---

## 🆘 Need Help?

**Backend won't start?**
→ Check MongoDB connection in .env

**Port 3000 in use?**
→ Change `PORT=3001` in .env

**Can't connect from mobile?**
→ Update `API_BASE_URL` in `mobile/src/config/api.ts`

---

**📚 Full Documentation:** [DEPLOYMENT.md](./DEPLOYMENT.md)

**🎉 Ready to go!**
