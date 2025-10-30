import { create } from "zustand";
import toast from "react-hot-toast";
import axios, { CanceledError } from "axios";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  abortController: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  typingUsers: {},

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data.users || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId, options = {}) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`, { signal: options.signal });
      set({ messages: res.data.messages || [], lastFetched: userId });
    } catch (error) {
      if (error instanceof CanceledError) {
        // Don't show toast for aborted requests
        return;
      }
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      // The message will be added via socket event, so we don't add it here.
      // This prevents duplicate messages.
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      throw error; // Re-throw to allow component to handle UI state
    } finally {
      set({ isSendingMessage: false });
    }
  },

  // Add message to the store, called by socket event
  addMessage: (message) => {
    const { selectedUser, messages } = get();
    // Add message only if it belongs to the current conversation
    if (
      selectedUser &&
      (message.senderId?.toString() === selectedUser._id?.toString() ||
       message.receiverId?.toString() === selectedUser._id?.toString())
    ) {
      // Avoid duplicates by checking _id
      const messageExists = messages.some(msg => msg._id?.toString() === message._id?.toString());
      if (!messageExists) {
        set({ messages: [...messages, message] });
      }
    }
  },

  // Listen for socket events
  subscribeToMessages: () => {
    const { socket } = get();
    if (!socket) return;

    socket.on("newMessage", (message) => {
      console.log("Received new message via socket:", message);
      get().addMessage(message);
    });

    socket.on("getOnlineUsers", (userIds) => {
      console.log("Online users updated:", userIds);
      // Update online users in auth store
      const { useAuthStore } = require("./useAuthStore");
      useAuthStore.getState().setOnlineUsers(userIds);
    });

    socket.on("userTyping", (data) => {
      console.log("Typing indicator:", data);
      // Handle typing indicators in UI
      set({ typingUsers: { ...get().typingUsers, [data.senderId]: data.isTyping } });
    });
  },

  // Unsubscribe from socket events
  unsubscribeFromMessages: () => {
    const { socket } = get();
    if (!socket) return;

    socket.off("newMessage");
    socket.off("getOnlineUsers");
    socket.off("userTyping");
  },

  setSelectedUser: async (selectedUser) => {
    const { selectedUser: currentUser, abortController: currentAbortController } = get();
    if (currentUser?._id === selectedUser?._id) return; // Avoid re-fetching for the same user

    // Abort previous fetch if it's still running
    if (currentAbortController) {
      currentAbortController.abort();
    }

    const newAbortController = new AbortController();

    set({ selectedUser, messages: [], abortController: newAbortController }); // Set new user and clear previous messages
    try {
      if (selectedUser) {
        await get().getMessages(selectedUser._id, { signal: newAbortController.signal }); // Fetch messages for the new user
      }
    } catch (error) {
      if (!(error instanceof CanceledError)) {
        set({ selectedUser: null }); // Reset on error
        toast.error("Failed to load messages for selected user");
      }
    }
  },

  reset: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({ selectedUser: null, messages: [], abortController: null, typingUsers: {} });
  }
}));
