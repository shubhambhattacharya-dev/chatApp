import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore.js";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:8000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // ✅ Check authentication
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check-auth");
      set({ authUser: res.data.user });
      get().connectSocket?.();
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ✅ Signup
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data.user });
      toast.success("Account created successfully");
      get().connectSocket?.();
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
      set({ authUser: res.data.user });
      toast.success("Logged in successfully");
      get().connectSocket?.();
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
    } catch (error) {
      // Don't show an error to the user, but log it for debugging
      console.error("Error during server-side logout:", error.response?.data?.message || error.message);
    } finally {
      get().disconnectSocket?.();
      set({ authUser: null });
      toast.success("Logged out successfully");
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

  // ✅ Connect Socket
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      withCredentials: true, // Send cookies with the connection request
    });

    newSocket.on("connect", () => {
      // Now handled by the online users listener
    });

    newSocket.on("connect_error", (error) => {
      toast.error(`Connection failed: ${error.message}`);
    });

    newSocket.on("disconnect", (reason) => {
      if (reason !== "io client disconnect") {
        toast.error("Disconnected from the server");
      }
    });

    // ✅ Online users update
    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // ✅ New message listener
    newSocket.on("newMessage", (newMessage) => {
      const { selectedUser, messages } = useChatStore.getState();
      // Only add the message if the chat is currently open
      if (selectedUser?._id === newMessage.senderId._id) {
        useChatStore.setState({ messages: [...messages, newMessage] });
      }
      // Optionally, add a notification for messages received when the chat is not open
    });

    set({ socket: newSocket });
  },

  // ✅ Disconnect Socket
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
	  socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("getOnlineUsers");
      socket.off("newMessage");
      if (socket.connected) {
        socket.disconnect();
      }
    }
    set({ socket: null, onlineUsers: [] });
  },
}));
