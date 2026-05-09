"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function initializeSocket(userId: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
    query: { userId },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("getOnlineUsers", (users: string[]) => {
    console.log("Online users:", users);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function emitMessage(receiverId: string, message: any): void {
  if (socket?.connected) {
    socket.emit("sendMessage", { receiverId, message });
  }
}

export function onMessageReceived(callback: (message: any) => void): void {
  if (socket) {
    socket.on("newMessage", callback);
  }
}

export function offMessageReceived(): void {
  if (socket) {
    socket.off("newMessage");
  }
}