import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:8000";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: false,
  onlineUsers: [],
  socket: null,

  // ✅ Check authentication
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check-auth");
      get().setAuthUser(res.data.user);
    } catch (error) {
      // if check-auth fails, it means no valid cookie, so authUser is null
      get().setAuthUser(null);
      get().disconnectSocket();
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ✅ Signup
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      get().setAuthUser(res.data.user);
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  // ✅ Login
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      get().setAuthUser(res.data.user);
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // ✅ Logout
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket?.(); // disconnect first
      get().setAuthUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  // ✅ Update Profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set((state) => ({ authUser: { ...state.authUser, ...res.data.user } }));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ Set auth user and manage socket connection
  setAuthUser: (user) => {
    set({ authUser: user });
    if (user) {
      get().connectSocket();
    } else {
      get().disconnectSocket();
    }
  },

  // ✅ Connect Socket
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    try {
      console.log("Connecting socket for user:", authUser._id);
      const token = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];

      const newSocket = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
        toast.error("Connection failed, retrying...");
      });

      newSocket.on("disconnect", (reason) => {
        console.warn("⚠️ Socket disconnected:", reason);
        if (reason === "io server disconnect") {
          // Server disconnected, try to reconnect
          newSocket.connect();
        }
      });

      // ✅ Online users update
      newSocket.on("getOnlineUsers", (userIds) => {
        console.log("Online users received:", userIds);
        set({ onlineUsers: userIds });
      });

      set({ socket: newSocket });

      // Subscribe to chat messages
      get().subscribeToMessages();
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      toast.error("Failed to connect to chat server");
    }
  },

  // ✅ Disconnect Socket
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
      console.log("Socket disconnected manually");
    }
    set({ socket: null, onlineUsers: [] });
  },

  // Subscribe to chat messages
  subscribeToMessages: () => {
    const { socket } = get();
    if (!socket) return;

    socket.on("newMessage", (message) => {
      console.log("Received new message via socket:", message);
      // Import and use chat store
      const { useChatStore } = require("./useChatStore");
      useChatStore.getState().addMessage(message);
    });
  },
}));
