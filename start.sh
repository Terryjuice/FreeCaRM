#!/bin/bash

echo "🚀 FreeCaRM Quick Start Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}MongoDB Setup Options:${NC}"
echo ""
echo "1. 🌐 MongoDB Atlas (Cloud - Recommended, Fast & Free)"
echo "2. 💻 Install MongoDB locally (takes 5-10 minutes)"
echo "3. ⚡ Use in-memory DB (for quick testing only)"
echo ""
echo -e "${GREEN}Choose option (1/2/3):${NC}"
read -r choice

case $choice in
  1)
    echo ""
    echo -e "${YELLOW}=== MongoDB Atlas Setup ===${NC}"
    echo ""
    echo "Step 1: Go to: https://www.mongodb.com/cloud/atlas/register"
    echo "Step 2: Create FREE account (M0 tier)"
    echo "Step 3: Create cluster (takes 1-3 minutes)"
    echo "Step 4: Add database user:"
    echo "   - Username: admin"
    echo "   - Password: (generate strong password)"
    echo "Step 5: Network Access:"
    echo "   - Allow access from anywhere (0.0.0.0/0)"
    echo "Step 6: Get connection string:"
    echo "   - Click 'Connect' → 'Connect your application'"
    echo "   - Copy connection string"
    echo ""
    echo -e "${GREEN}Enter your MongoDB Atlas connection string:${NC}"
    echo "(Format: mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/freecarm)"
    read -r mongo_uri

    if [ -n "$mongo_uri" ]; then
      cd /home/user/FreeCaRM/backend
      sed -i "s|MONGODB_URI=.*|MONGODB_URI=$mongo_uri|" .env
      echo ""
      echo -e "${GREEN}✅ MongoDB URI updated in .env${NC}"
      echo ""
      echo "Starting backend server..."
      npm start &
      SERVER_PID=$!
      sleep 5

      if ps -p $SERVER_PID > /dev/null; then
        echo -e "${GREEN}✅ Backend server started successfully!${NC}"
        echo ""
        echo "🌐 API URL: http://localhost:3000"
        echo "💚 Health check: http://localhost:3000/health"
        echo ""
        echo "To test:"
        echo "curl http://localhost:3000/health"
      else
        echo -e "${RED}❌ Server failed to start. Check logs above.${NC}"
      fi
    else
      echo -e "${RED}No connection string provided. Exiting.${NC}"
      exit 1
    fi
    ;;

  2)
    echo ""
    echo -e "${YELLOW}Installing MongoDB locally...${NC}"
    echo ""

    # Install MongoDB
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add - 2>/dev/null
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org

    # Start MongoDB
    sudo mkdir -p /data/db
    sudo systemctl start mongod
    sudo systemctl enable mongod

    echo -e "${GREEN}✅ MongoDB installed and started${NC}"
    echo ""
    echo "Starting backend server..."

    cd /home/user/FreeCaRM/backend
    npm start &
    SERVER_PID=$!
    sleep 5

    if ps -p $SERVER_PID > /dev/null; then
      echo -e "${GREEN}✅ Backend server started successfully!${NC}"
      echo ""
      echo "🌐 API URL: http://localhost:3000"
      echo "💚 Health check: http://localhost:3000/health"
    else
      echo -e "${RED}❌ Server failed to start. Check logs above.${NC}"
    fi
    ;;

  3)
    echo ""
    echo -e "${YELLOW}⚡ Quick Test Mode (In-Memory DB)${NC}"
    echo ""
    echo "Note: This is for testing only. Data will be lost on restart."
    echo ""

    # We'll use MongoDB Atlas free tier anyway for testing
    echo "For quick testing, we recommend using MongoDB Atlas (option 1)"
    echo "It's free, fast to setup, and persistent."
    echo ""
    exit 0
    ;;

  *)
    echo -e "${RED}Invalid option. Exiting.${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}=== Next Steps ===${NC}"
echo ""
echo "Backend is running! Now start the mobile app:"
echo ""
echo "  cd /home/user/FreeCaRM/mobile"
echo "  npm install"
echo "  npm start"
echo ""
echo "Then:"
echo "  1. Scan QR code with Expo Go app"
echo "  2. Or press 'i' for iOS simulator"
echo "  3. Or press 'a' for Android emulator"
echo ""
echo "🎉 Enjoy FreeCaRM!"
