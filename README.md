# JustChat - Professional Real-Time Chat Application

A high-performance, secure, and scalable chat application built with the MERN stack and Socket.io.

## 🚀 Key Features

- **Real-time Messaging:** Low-latency communication via Socket.io.
- **Secure Authentication:** JWT-based auth with HTTP-only cookies and bcrypt hashing.
- **Robust Architecture:** Modular service-oriented architecture with centralized error handling.
- **File Uploads:** Integrated Cloudinary support for profile pictures and message attachments.
- **Responsive Design:** Polished UI using Tailwind CSS and DaisyUI.
- **Performance Optimized:** Lazy loading, code splitting, and efficient MongoDB indexing.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Zustand, Tailwind CSS, DaisyUI, Lucide React.
- **Backend:** Node.js, Express 5, MongoDB (Mongoose), Socket.io, Pino (Logging).
- **Security:** Helmet, Express Rate Limit, CSRF protection via SameSite cookies.
- **DevOps:** Docker, Docker Compose.

## 📁 Project Structure

```text
chatApp/
├── backend/
│   ├── src/
│   │   ├── config.js         # Centralized environment configuration
│   │   ├── controllers/      # HTTP request handlers (thin controllers)
│   │   ├── services/         # Business logic (service layer)
│   │   ├── models/           # Mongoose schemas
│   │   ├── middleware/       # Auth, validation, and error middlewares
│   │   └── lib/util/         # Standardized utilities (logger, error, etc.)
│   └── bootstrap.js          # App entry point with env setup
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components & ErrorBoundary
│   │   ├── pages/            # View components (lazy loaded)
│   │   ├── store/            # Zustand state management
│   │   └── lib/              # Axios instance and utils
└── Dockerfile                # Production-ready multi-stage build
```

## 🚦 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance
- Cloudinary Account

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shubhambhattacharya-dev/chatApp.git
   cd chatApp
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env # Fill in your credentials
   npm install
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Docker Deployment

```bash
docker-compose up --build
```

## 🛡 Security & Best Practices

- **Service Layer:** Decoupled business logic from controllers for better testability.
- **Global Error Handling:** Consistent API responses for operational and programming errors.
- **Environment Validation:** Fail-fast mechanism if required configuration is missing.
- **Logging:** Structured logging using Pino for production-grade observability.
- **Error Boundaries:** Prevents UI crashes from propagating.

## 📄 License

ISC
