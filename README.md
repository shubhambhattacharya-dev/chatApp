```markdown
# 💬 Real-Time Chat Application

A full-stack real-time chat application built using **React, Node.js, Express, MongoDB, and Socket.io** with modern UI and instant communication features.

---

## 🚀 Features

- ⚡ Real-time messaging (Socket.io)
- 🔐 Secure authentication (JWT)
- 👥 Online / Offline status
- ✍️ Typing indicator
- 🖼️ Image uploads (Cloudinary)
- 🗑️ Message delete
- 📱 Responsive UI (Tailwind + DaisyUI)
- 🧠 Zustand state management
- 📊 Pino logging system
- 🧼 Clean folder structure

---

## 🛠 Tech Stack

### **Frontend**
- React 19 + Vite
- TailwindCSS + DaisyUI
- Zustand
- Axios
- Socket.io-client

### **Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- Cloudinary
- Pino Logger

---

## 📦 Installation & Setup

### Clone repo
```bash
git clone https://github.com/shubhambhattacharya-dev/chatApp.git
cd chatApp
```

#### Install dependencies

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Backend**
```bash
cd backend
npm install
npm run dev
```

#### 🔧 Environment Variables

Create `.env` inside `chatApp/backend`

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SOCKET_CORS_ORIGIN=http://localhost:3000
```

Create `.env` inside `chatApp/frontend`

```
VITE_API_URL=http://localhost:5000
```

✅ `.env.example` file included for reference

#### 🏃 Run App
- Frontend 👉 http://localhost:3000
- Backend 👉 http://localhost:5000

---

## 🚀 Deployment

Deployment steps (Render / Vercel / Railway / Netlify):

### Backend deploy
- Push code to GitHub
- Create Render service
- Add environment variables
- Deploy

### Frontend deploy
- Build with `npm run build`
- Deploy build folder to Vercel/Netlify

#### 📡 API Endpoints

**Auth**
| Method | Endpoint                  | Description      |
|--------|---------------------------|------------------|
| POST   | `/api/auth/signup`        | Register user    |
| POST   | `/api/auth/login`         | Login            |
| POST   | `/api/auth/logout`        | Logout           |
| GET    | `/api/auth/me`            | Get current user |

**Messages**
| Method | Endpoint                       | Description        |
|--------|--------------------------------|--------------------|
| GET    | `/api/messages/:userId`        | Get chat history   |
| POST   | `/api/messages/send/:userId`   | Send message       |
| DELETE | `/api/messages/:messageId`     | Delete message     |
| POST   | `/api/messages/upload-image`   | Upload image       |

**Users**
| Method | Endpoint              | Description      |
|--------|-----------------------|------------------|
| GET    | `/api/users`          | Get all users    |
| GET    | `/api/users/profile`  | Profile          |
| PUT    | `/api/users/profile`  | Update profile   |

#### ⚡ Socket Events

| Client → Server       | Server → Client       |
|----------------------|------------------------|
| typing               | typing                 |
| stopTyping           | stopTyping             |
| messageDeleted       | messageDeleted         |
| (none)               | getOnlineUsers         |
| (none)               | newMessage             |

---

## 📁 Project Structure

```
chatApp/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── backend/
    ├── src/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   └── server.js
    └── package.json
```

---

## 🤝 Contributing

1. Fork repo
2. Create feature branch
3. Commit changes
4. Submit PR

---

## 📜 License
ISC
```

README final ✅  
.env.example ✅  
Pushed ✅  
Next project?
