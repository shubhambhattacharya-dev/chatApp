import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";
import { io, Socket } from "socket.io-client";
import DOMPurify from "dompurify";

export interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  profilePic: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

interface AuthState {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  socket: Socket | null;

  checkAuth: () => Promise<void>;
  signup: (data: any) => Promise<void>;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<any>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  deleteUser: () => Promise<void>;
}

const getBaseURL = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  if (import.meta.env.PROD) {
    return "https://justchat-d566.onrender.com";
  }
  return "http://localhost:5000";
};

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (error: any) {
      set({ authUser: null });
      toast.error(error.response?.data?.message || "Session expired. Please log in again.");
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const sanitizedData = {
        fullName: DOMPurify.sanitize(data.fullName),
        email: DOMPurify.sanitize(data.email),
        password: data.password,
      };
      const res = await axiosInstance.post("/auth/signup", sanitizedData);
      set({ authUser: res.data.user });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      // Don't show an error to the user
    } finally {
      get().disconnectSocket();
      set({ authUser: null });
      toast.success("Logged out successfully");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      let requestData;
      let headers = {};

      if (data instanceof FormData) {
        requestData = data;
      } else {
        const sanitizedData: any = {};
        if (data.fullName) sanitizedData.fullName = DOMPurify.sanitize(data.fullName);
        if (data.email) sanitizedData.email = DOMPurify.sanitize(data.email);
        if (data.password) sanitizedData.password = data.password;
        if (data.profilePic) sanitizedData.profilePic = data.profilePic;
        requestData = sanitizedData;
      }

      const res = await axiosInstance.put("/auth/update-profile", requestData, { headers });
      const updatedUser = res.data.user;
      set({ authUser: updatedUser });

      const chatStore = useChatStore.getState() as any;
      if (chatStore.selectedUser?._id === updatedUser._id) {
        chatStore.setSelectedUser(updatedUser);
      }
      const newUsers = chatStore.users.map((u: any) => u._id === updatedUser._id ? updatedUser : u);
      chatStore.setUsers(newUsers);

      toast.success("Profile updated successfully");
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(getBaseURL(), {
      transports: ["websocket"],
      secure: import.meta.env.PROD,
      withCredentials: true,
      query: {
        userId: authUser._id,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 20000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error(`Connection failed: ${error.message}`);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected, reason:", reason);
      if (reason !== "io client disconnect") {
        toast.error("Disconnected from the server. Attempting to reconnect...");
      }
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      toast.success("Reconnected to the server");
    });

    newSocket.on("reconnect_failed", () => {
      console.error("Failed to reconnect after all attempts");
      toast.error("Unable to reconnect. Please refresh the page.");
    });

    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      console.log("Online users updated:", userIds);
      (useChatStore.getState() as any).setOnlineUsers(userIds);
    });

    newSocket.on("newMessage", (newMessage: any) => {
      console.log("New message received:", newMessage);

      (useChatStore.getState() as any).handleNewMessage(newMessage);

      if (newMessage.senderId._id !== get().authUser?._id) {
        toast.success(`New message from ${newMessage.senderId.fullName}`, {
          duration: 3000,
          position: 'top-right',
        });
      }
    });

    newSocket.on("messageDeleted", (deletedMessageId: string) => {
      (useChatStore.getState() as any).handleMessageDeleted(deletedMessageId);
    });

    newSocket.on("messageRead", ({ messageId, readAt }: { messageId: string, readAt: string }) => {
      (useChatStore.getState() as any).handleMessageRead(messageId, readAt);
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("getOnlineUsers");
      socket.off("newMessage");
      socket.off("messageDeleted");

      if (socket.connected) {
        socket.disconnect();
      }
    }
    set({ socket: null });
  },

  deleteUser: async () => {
    const { authUser, logout } = get();
    if (!authUser?._id) return toast.error("No authenticated user found.");

    try {
      await axiosInstance.delete(`/auth/delete-account`);
      toast.success("Account deleted successfully!");
      logout();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  },
}));
