#!/bin/bash

echo "🔍 FreeCaRM Status Check"
echo "======================="
echo ""

# Check backend
echo "📦 Backend Status:"
if [ -d "/home/user/FreeCaRM/backend/dist" ]; then
  echo "  ✅ Built successfully"
else
  echo "  ❌ Not built yet"
fi

if [ -f "/home/user/FreeCaRM/backend/.env" ]; then
  echo "  ✅ .env file exists"
else
  echo "  ❌ .env file missing"
fi

if pgrep -f "node dist/index.js" > /dev/null; then
  echo "  ✅ Server is running"
  PORT=$(grep "^PORT=" /home/user/FreeCaRM/backend/.env | cut -d'=' -f2)
  echo "  🌐 http://localhost:${PORT:-3000}"
else
  echo "  ❌ Server is not running"
fi

echo ""

# Check MongoDB
echo "🗄️  Database Status:"
MONGO_URI=$(grep "^MONGODB_URI=" /home/user/FreeCaRM/backend/.env | cut -d'=' -f2)
if [[ $MONGO_URI == mongodb+srv://* ]]; then
  echo "  ✅ MongoDB Atlas configured"
elif pgrep -f mongod > /dev/null; then
  echo "  ✅ MongoDB running locally"
else
  echo "  ⚠️  MongoDB not configured"
  echo "     Run: ./start.sh to setup"
fi

echo ""

# Check mobile
echo "📱 Mobile App:"
if [ -d "/home/user/FreeCaRM/mobile/node_modules" ]; then
  echo "  ✅ Dependencies installed"
else
  echo "  ⚠️  Need to run: npm install"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Quick actions
if ! pgrep -f "node dist/index.js" > /dev/null; then
  echo "🚀 Quick Start:"
  echo "   ./start.sh     - Setup and start everything"
  echo ""
fi

# Test endpoint
if pgrep -f "node dist/index.js" > /dev/null; then
  echo "🧪 Test API:"
  PORT=$(grep "^PORT=" /home/user/FreeCaRM/backend/.env | cut -d'=' -f2 || echo "3000")
  echo "   curl http://localhost:${PORT}/health"
  echo ""
fi
