# ChatApp - Production-Ready MERN Chat Application

A modern, secure, and scalable real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring Socket.io for real-time communication, comprehensive security measures, and production-ready architecture.

## 🚀 Features

- **Real-time messaging** with Socket.io and JWT authentication
- **Secure authentication** with bcrypt password hashing and JWT tokens
- **File upload** with Cloudinary integration and validation
- **Responsive UI** with DaisyUI and Tailwind CSS
- **Theme switching** (light/dark mode) with Zustand state management
- **Online/offline user status** with real-time updates
- **Message status indicators** and typing indicators
- **Rate limiting** and security middleware
- **Comprehensive testing** with Jest and Supertest
- **Production-ready** with proper error handling and logging

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, DaisyUI, Zustand, Axios, Socket.io-client
- **Backend:** Node.js, Express.js, MongoDB, Socket.io, JWT, bcrypt
- **Security:** Helmet, CORS, express-rate-limit, express-validator
- **File Storage:** Cloudinary with validation
- **Testing:** Jest, Supertest, MongoDB Memory Server
- **Deployment:** Ready for production deployment

## 🏁 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatApp
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install

   # Frontend dependencies
   cd ../frontend
   npm install

   # Return to root
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env with your actual values
   # Required: MONGODB_URI, JWT_SECRET, CLOUDINARY_* credentials
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-here-generate-with-openssl-rand-hex-64
BCRYPT_ROUNDS=12

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Server Configuration
PORT=8000
NODE_ENV=development

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:8000/api
FRONTEND_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests (if added)
cd ../frontend
npm test
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | User registration | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/logout` | User logout | ✅ |
| GET | `/api/auth/check-auth` | Check auth status | ✅ |
| PUT | `/api/auth/update-profile` | Update profile | ✅ |

### Message Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages/users` | Get users for sidebar | ✅ |
| GET | `/api/messages/:id` | Get conversation with user | ✅ |
| POST | `/api/messages/send/:id` | Send message | ✅ |
| POST | `/api/messages/upload-image` | Upload image | ✅ |

### Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client→Server | Establish connection with JWT |
| `newMessage` | Server→Client | New message received |
| `getOnlineUsers` | Server→Client | Online users list |
| `userTyping` | Server→Client | Typing indicator |
| `typing_start` | Client→Server | Start typing |
| `typing_stop` | Client→Server | Stop typing |

## 🏗️ Project Structure

```
chatApp/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, security
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── lib/            # Utilities (socket, cloudinary, logger)
│   │   ├── constants.js    # App constants
│   │   └── server.js       # Express app setup
│   ├── tests/              # Jest test files
│   ├── jest.config.js      # Test configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── lib/            # Utilities (axios, etc.)
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── vite.config.js
├── .env.example            # Environment template
├── .gitignore             # Git ignore rules
└── README.md
```

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password hashing** with bcrypt (12 rounds)
- **CORS protection** with allowed origins whitelist
- **Rate limiting** on auth and message endpoints
- **Input validation** with express-validator
- **File upload validation** (MIME type, size limits)
- **Helmet security headers**
- **Socket authentication** preventing unauthorized connections

## 🚀 Deployment

### Backend Deployment
```bash
# Build and start
npm run build
npm start
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files or deploy to CDN
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure production MongoDB URI
- Set secure Cloudinary credentials
- Configure production CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 Recent Security & Performance Improvements

- ✅ **Removed exposed credentials** from version control
- ✅ **Implemented JWT socket authentication** with room-based messaging
- ✅ **Added comprehensive database indexes** for query optimization
- ✅ **Enhanced file upload validation** with MIME type and size checks
- ✅ **Fixed frontend state management** circular dependencies
- ✅ **Added automated testing** with Jest and Supertest
- ✅ **Strengthened CORS policy** with allowed origins whitelist
- ✅ **Improved bcrypt security** with configurable rounds

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include environment details and error logs
