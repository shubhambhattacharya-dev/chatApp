import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore.js";
import { io } from "socket.io-client";
import DOMPurify from "dompurify";

const getBaseURL = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  return "http://localhost:5000";
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
    } catch (error) {
      set({ authUser: null });
      toast.error(error.response?.data?.message || "Session expired. Please log in again.");
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ✅ Signup
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
      const sanitizedData = {};
      if (data.fullName) {
        sanitizedData.fullName = DOMPurify.sanitize(data.fullName);
      }
      if (data.email) {
        sanitizedData.email = DOMPurify.sanitize(data.email);
      }
      if (data.password) {
        sanitizedData.password = data.password;
      }
      if (data.profilePic) {
        sanitizedData.profilePic = data.profilePic;
      }

      const res = await axiosInstance.put("/auth/update-profile", sanitizedData);
      const updatedUser = res.data.user;
      set({ authUser: updatedUser });

      const { selectedUser, setSelectedUser, users, setUsers } = useChatStore.getState();
      if (selectedUser?._id === updatedUser._id) {
        setSelectedUser(updatedUser);
      }
      const newUsers = users.map(u => u._id === updatedUser._id ? updatedUser : u);
      setUsers(newUsers);

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
      transports: ["websocket"],
      secure: import.meta.env.PROD,
      withCredentials: true, // Send cookies with the connection request
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

    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("Online users updated:", userIds);
      useChatStore.getState().setOnlineUsers(userIds);
    });

    newSocket.on("newMessage", (newMessage) => {
      console.log("New message received:", newMessage);

      useChatStore.getState().handleNewMessage(newMessage);

      if (newMessage.senderId._id !== get().authUser?._id) {
        toast.success(`New message from ${newMessage.senderId.fullName}`, {
          duration: 3000,
          position: 'top-right',
        });
      }
    });

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