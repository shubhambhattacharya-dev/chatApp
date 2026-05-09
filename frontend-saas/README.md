# JustChat SaaS - Modern Team Communication Platform

A modern SaaS chat application built with Next.js 14, featuring workspaces, real-time messaging, and enterprise-ready architecture.

## Features

### Core Features
- **Multi-workspace Support**: Create and manage multiple workspaces
- **Real-time Messaging**: Instant message delivery with read receipts
- **User Authentication**: JWT-based auth with secure cookies
- **User Profiles**: Customizable profiles with avatars

### SaaS Features
- **Subscription Plans**: Starter, Pro, Enterprise tiers
- **Multi-tenant Architecture**: Workspace-based isolation
- **Role-based Access**: Owner, Admin, Member roles
- **Billing Integration**: Stripe-ready payment system

### UI/UX
- **Modern Design**: Clean, professional UI inspired by Linear/Slack
- **Responsive**: Works on desktop, tablet, and mobile
- **Dark Mode**: System-aware dark mode support
- **Fast Navigation**: App router with optimized layouts

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI (Shadcn-style components)
- Zustand (State Management)
- Axios (API Client)

### Backend
- Next.js API Routes
- MongoDB (Mongoose)
- JWT Authentication
- Socket.IO ready

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to frontend-saas:
```bash
cd frontend-saas
```

3. Install dependencies:
```bash
npm install
```

4. Create `.env.local`:
```env
MONGO_DB=mongodb://localhost:27017/justchat
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=3000
```

5. Run development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend-saas/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth pages (login, signup)
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/         # Dashboard pages
│   │   │   └── dashboard/
│   │   │       ├── messages/    # Chat interface
│   │   │       ├── settings/    # User settings
│   │   │       ├── billing/     # Subscription management
│   │   │       └── profile/     # User profile
│   │   ├── api/                 # API routes
│   │   │   ├── auth/
│   │   │   ├── messages/
│   │   │   └── workspaces/
│   │   ├── page.tsx             # Landing page
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   └── ui/                  # UI components
│   ├── models/                  # Mongoose models
│   ├── store/                   # Zustand stores
│   └── lib/                     # Utilities
└── public/                      # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check auth status

### Messages
- `GET /api/messages/users` - Get all users
- `GET /api/messages/[userId]` - Get messages with user
- `POST /api/messages/send` - Send message
- `DELETE /api/messages/[messageId]` - Delete message

### Workspaces
- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/[id]` - Get workspace details
- `PUT /api/workspaces/[id]` - Update workspace

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Docker
```bash
docker build -t justchat-saas .
docker run -p 3000:3000 --env-file .env.local justchat-saas
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_DB` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port | No |

## License

MIT