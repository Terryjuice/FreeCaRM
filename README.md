# FreeCaRM

**Free Car Repair Management** - AI-powered vehicle inspection and damage assessment platform

FreeCaRM is a comprehensive mobile and web application similar to Tchek that enables automated vehicle inspections using AI-powered damage detection. It helps inspectors, insurance companies, and repair shops quickly assess vehicle damage and estimate repair costs.

## Features

### Core Functionality
- **AI-Powered Damage Detection**: Automatic detection of scratches, dents, cracks, and other vehicle damage
- **Multi-Angle Photo Capture**: Capture vehicle from 12+ standardized angles
- **Cost Estimation**: Automatic calculation of repair costs based on damage type and severity
- **PDF Report Generation**: Professional inspection reports with damage details and cost breakdown
- **Inspection Management**: Track all inspections with status updates and search functionality
- **User Authentication**: Secure JWT-based authentication system

### Technical Features
- **Mobile App**: React Native with Expo for iOS and Android
- **Backend API**: Node.js/Express with TypeScript
- **Database**: MongoDB for data persistence
- **AI/ML**: TensorFlow.js integration for damage detection
- **Real-time Updates**: WebSocket support for live inspection updates
- **File Storage**: Local and cloud storage support for images

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Sharp for image processing
- **AI/ML**: TensorFlow.js Node
- **PDF Generation**: PDFKit
- **API Documentation**: OpenAPI/Swagger

### Mobile App
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **UI Library**: React Native Paper
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Camera**: Expo Camera
- **Image Picker**: Expo Image Picker
- **Location**: Expo Location

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB 7+
- Expo CLI (for mobile development)
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FreeCaRM.git
   cd FreeCaRM
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Setup environment variables**

   Backend (.env):
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7

   # Or use Docker Compose
   docker-compose up -d mongodb
   ```

5. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:3000

6. **Start the mobile app**
   ```bash
   cd mobile
   npm start
   ```
   Then scan the QR code with Expo Go app or press 'i' for iOS, 'a' for Android simulator

### Using Docker Compose

Run the entire stack with one command:

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 3000

## Project Structure

```
FreeCaRM/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Entry point
│   ├── uploads/            # Uploaded files storage
│   ├── models/             # AI models
│   └── package.json
│
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context providers
│   │   ├── navigation/     # Navigation configuration
│   │   ├── screens/        # App screens
│   │   ├── services/       # API services
│   │   ├── theme/          # Theme configuration
│   │   └── types/          # TypeScript types
│   ├── App.tsx             # Root component
│   └── package.json
│
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Backend Dockerfile
└── README.md
```

## API Documentation

Once the backend is running, visit:
- Health Check: http://localhost:3000/health

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

#### Inspections
- `POST /api/inspections` - Create inspection
- `GET /api/inspections` - List inspections
- `GET /api/inspections/:id` - Get inspection details
- `PUT /api/inspections/:id` - Update inspection
- `DELETE /api/inspections/:id` - Delete inspection
- `POST /api/inspections/:id/images` - Upload image
- `POST /api/inspections/:id/analyze` - Analyze images

#### Damages
- `GET /api/damages/inspection/:id` - Get damages for inspection
- `POST /api/damages` - Create manual damage entry
- `PUT /api/damages/:id` - Update damage
- `DELETE /api/damages/:id` - Delete damage

#### Reports
- `POST /api/reports/generate/:id` - Generate PDF report
- `GET /api/reports/download/:id` - Download report

## Mobile App Usage

1. **Register/Login**: Create an account or sign in
2. **Create Inspection**: Add vehicle information (make, model, year, VIN, etc.)
3. **Capture Photos**: Take photos from multiple angles:
   - Front, Rear, Left Side, Right Side
   - Four corners (Front-Left, Front-Right, Rear-Left, Rear-Right)
   - Interior, Dashboard, VIN Plate
   - Close-ups of any damage
4. **Analyze**: Tap "Analyze Damages" to run AI detection
5. **Review Results**: View detected damages and cost estimates
6. **Generate Report**: Create a professional PDF report
7. **Manage Inspections**: View history, search, and track status

## AI Model Integration

The current implementation uses a mock AI detection service. To integrate a real AI model:

1. Train or obtain a vehicle damage detection model (YOLO, Faster R-CNN, etc.)
2. Export model to TensorFlow.js format or ONNX
3. Place model files in `backend/models/`
4. Update `backend/src/services/damageDetection.service.ts`:
   - Load your trained model in `loadModel()`
   - Implement real inference in `detectDamages()`
5. Configure model path in `.env`: `DAMAGE_DETECTION_MODEL=your_model.onnx`

### Recommended Models
- YOLOv5/YOLOv8 for real-time detection
- Faster R-CNN for higher accuracy
- EfficientDet for mobile deployment

## Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/freecarm |
| JWT_SECRET | JWT secret key | (required) |
| JWT_EXPIRES_IN | Token expiration | 7d |
| MAX_FILE_SIZE | Max upload size in bytes | 10485760 (10MB) |
| DEFAULT_LABOR_RATE | Hourly labor rate | 75 |
| DEFAULT_PARTS_MARKUP | Parts cost multiplier | 1.3 |

### Mobile App Configuration

Update API URL in `mobile/src/config/api.ts`:

```typescript
export const API_BASE_URL = 'http://your-api-url:3000/api';
```

For local development:
- iOS Simulator: `http://localhost:3000/api`
- Android Emulator: `http://10.0.2.2:3000/api`
- Physical Device: `http://YOUR_IP:3000/api`

## Development

### Backend Development

```bash
cd backend
npm run dev        # Start dev server with auto-reload
npm run build      # Build TypeScript
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Mobile Development

```bash
cd mobile
npm start          # Start Expo dev server
npm run android    # Open on Android
npm run ios        # Open on iOS
npm run web        # Open in web browser
```

## Deployment

### Backend Deployment

1. Build the application:
   ```bash
   cd backend
   npm run build
   ```

2. Deploy using Docker:
   ```bash
   docker-compose up -d
   ```

3. Or deploy to cloud platforms:
   - AWS Elastic Beanstalk
   - Google Cloud Run
   - Azure App Service
   - Heroku

### Mobile App Deployment

1. **Build for iOS**:
   ```bash
   cd mobile
   expo build:ios
   ```
   Then submit to App Store via Application Loader

2. **Build for Android**:
   ```bash
   cd mobile
   expo build:android
   ```
   Upload APK/AAB to Google Play Console

## License

This project is licensed under the MIT License.

## Roadmap

- [ ] Web dashboard for desktop users
- [ ] Advanced AI model training pipeline
- [ ] Multi-language support
- [ ] Cloud storage integration (AWS S3, Google Cloud Storage)
- [ ] Real-time collaboration features
- [ ] Integration with repair shop systems
- [ ] Vehicle history tracking via VIN
- [ ] Automated insurance claim submission
- [ ] 3D damage visualization
- [ ] Voice notes and annotations

---

**Made with ❤️ for the automotive industry**