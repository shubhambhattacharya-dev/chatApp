import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "axios";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

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
      set({ messages: res.data.messages || [] });
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error; // Re-throw to allow interceptors to handle it.
      }
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      set({ isSendingMessage: false });
    }
  },

  setSelectedUser: (selectedUser) => {
    const { selectedUser: currentUser } = get();
    if (currentUser?._id === selectedUser?._id) return; // Avoid re-fetching for the same user

    set({ selectedUser, messages: [] }); // Set new user and clear previous messages
    get().getMessages(selectedUser._id); // Fetch messages for the new user
  },
}));
