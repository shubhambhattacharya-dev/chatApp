# Chat App

A real-time chat application built with React, Node.js, Express, and Socket.io.

## Features

- Real-time messaging with Socket.io
- User authentication and authorization
- Image sharing
- Typing indicators
- Online user status
- Message deletion
- Responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS + DaisyUI
- Zustand (state management)
- Socket.io-client
- Axios

### Backend
- Node.js
- Express.js
- Socket.io
- MongoDB with Mongoose
- JWT authentication
- Cloudinary (image uploads)
- Pino (logging)

## Installation

1. Clone the repository
2. Install dependencies for both frontend and backend:

```bash
# Frontend
cd chatApp/frontend
npm install

# Backend
cd ../backend
npm install
```

3. Create `.env` files in both directories with required environment variables

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SOCKET_CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Development

### Start Development Servers

```bash
# Terminal 1: Backend
cd chatApp/backend
npm run dev

# Terminal 2: Frontend
cd chatApp/frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Production Build

### Build Frontend
```bash
cd chatApp/frontend
npm run build
```

### Start Production Server
```bash
cd chatApp/backend
npm run start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Messages
- `GET /api/messages/:userId` - Get messages with a user
- `POST /api/messages/send/:userId` - Send message
- `DELETE /api/messages/:messageId` - Delete message
- `POST /api/messages/upload-image` - Upload image

### Users
- `GET /api/users` - Get all users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Socket Events

### Client to Server
- `typing` - User started typing
- `stopTyping` - User stopped typing
- `messageDeleted` - Message deleted

### Server to Client
- `getOnlineUsers` - List of online users
- `newMessage` - New message received
- `messageDeleted` - Message deleted notification
- `typing` - User typing notification
- `stopTyping` - User stopped typing notification

## Project Structure

```
chatApp/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── store/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── bootstrap.js
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License
