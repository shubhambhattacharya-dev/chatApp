# Base stage for shared dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Frontend Build Stage
FROM base AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Backend Production Stage
FROM base AS production
ENV NODE_ENV=production

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --only=production

COPY backend/ ./
# Copy built frontend files to backend's static folder
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Expose port
EXPOSE 5000

# Start command
CMD ["node", "bootstrap.js"]
