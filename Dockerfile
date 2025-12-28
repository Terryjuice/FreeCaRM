# Backend Dockerfile
FROM node:18-alpine AS backend

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Build TypeScript
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads/reports models

EXPOSE 3000

CMD ["npm", "start"]
