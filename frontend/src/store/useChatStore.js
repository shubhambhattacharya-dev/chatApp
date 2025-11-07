import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import axios from "axios";
import { useAuthStore } from "./useAuthStore";
import DOMPurify from "dompurify";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  onlineUsers: [],
  typingUsers: [], // Track users who are typing

  setUsers: (users) => set({ users }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

  // ✅ Fetch all chat users
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

  // ✅ Fetch messages with a specific user
  getMessages: async (userId, options = {}) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`, {
        signal: options.signal,
      });
      set({ messages: res.data || [] }); // Assuming res.data is the array of messages
    } catch (error) {
      if (axios.isCancel(error)) return; // Don't throw, just return silently
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // ✅ Send message to the selected user
  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser?._id) return toast.error("No user selected!");

    set({ isSendingMessage: true });
    try {
      const sanitizedMessage = DOMPurify.sanitize(messageData.message);
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        { ...messageData, message: sanitizedMessage }
      );

      // The backend will broadcast the message via Socket.IO, so no need for optimistic update here.

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      set({ isSendingMessage: false });
    }
  },

  // ✅ Handle incoming new message
  handleNewMessage: (newMessage) => {
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  // ✅ Handle message deletion
  handleMessageDeleted: (deletedMessageId) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== deletedMessageId),
    }));
  },

  // ✅ Delete a message
  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      get().handleMessageDeleted(messageId);
      toast.success("Message deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  // ✅ Handle typing indicators
  handleTyping: (senderId) => {
    const { selectedUser, typingUsers } = get();
    if (selectedUser && senderId === selectedUser._id && !typingUsers.includes(senderId)) {
      set({ typingUsers: [...typingUsers, senderId] });
    }
  },

  handleStopTyping: (senderId) => {
    set((state) => ({
      typingUsers: state.typingUsers.filter(id => id !== senderId),
    }));
  },

  // ✅ Send typing events
  startTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });
    }
  },

  stopTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (socket && selectedUser) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
  },

  // ✅ Select a user & load their messages
  setSelectedUser: (selectedUser) => {
    const { selectedUser: currentUser } = get();
    if (currentUser?._id === selectedUser?._id) return; // Avoid re-fetching same user

    set({ selectedUser, messages: [], typingUsers: [] });
    get().getMessages(selectedUser._id);
  },
}));