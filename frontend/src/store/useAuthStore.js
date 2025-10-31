import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore.js";
import { io } from "socket.io-client";

const getBaseURL = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  if (import.meta.env.MODE === "production") {
    return ""; // Use relative URLs in production (same domain)
  }
  return import.meta.env.MODE === "development" ? "http://localhost:8000" :"/";
};

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  socket: null,

  // ✅ Check authentication
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check-auth");
      set({ authUser: res.data.user });
      get().connectSocket();
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
      get().connectSocket();
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
      get().connectSocket();
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
    } finally {
      get().disconnectSocket();
      set({ authUser: null });
      toast.success("Logged out successfully");
    }
  },

  // ✅ Update Profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully");
      return res.data; // Return response for frontend to use
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      throw error; // Re-throw to allow frontend to handle
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ Connect Socket
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(getBaseURL(), {
      withCredentials: true, // Send cookies with the connection request
      query: {
        userId: authUser._id,
      },
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
        toast.error("Disconnected from the server");
      }
      // Do not reset onlineUsers here, let the getOnlineUsers event handle updates
    });

    // ✅ Online users update
    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("Online users updated:", userIds);
      useChatStore.getState().setOnlineUsers(userIds);
    });

    // ✅ New message listener (handle message updates and notifications)
    newSocket.on("newMessage", (newMessage) => {
      console.log("New message received:", newMessage);

      // Handle message updates in chat store
      useChatStore.getState().handleNewMessage(newMessage);

      // Show notification for new messages (only if not from current user)
      if (newMessage.senderId._id !== get().authUser?._id) {
        toast.success(`New message from ${newMessage.senderId.fullName}`, {
          duration: 3000,
          position: 'top-right',
        });
      }
    });

    // ✅ Message deletion listener
    newSocket.on("messageDeleted", (deletedMessageId) => {
      useChatStore.getState().handleMessageDeleted(deletedMessageId);
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
      socket.off("messageDeleted");

      if (socket.connected) {
        socket.disconnect();
      }
    }
    set({ socket: null });
    // Do not reset onlineUsers here, let the getOnlineUsers event handle updates
    // Note: We don't call setOnlineUsers([]) here to avoid overriding the real-time updates
  },

  // ✅ Delete User Account
  deleteUser: async () => {
    const { authUser, logout } = get();
    if (!authUser?._id) return toast.error("No authenticated user found.");

    try {
      await axiosInstance.delete(`/auth/delete-account`);
      toast.success("Account deleted successfully!");
      logout(); // Log out the user after successful deletion
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  },
}));
