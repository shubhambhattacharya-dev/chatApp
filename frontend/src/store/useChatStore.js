import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import axios from "axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  onlineUsers: [],

  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  selectedUser: JSON.parse(localStorage.getItem("selectedUser")) || null,
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
    const { selectedUser, messages } = get();
    if (!selectedUser?._id) return toast.error("No user selected!");

    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // Optimistic update: Add message to local state immediately
      const newMessage = res.data;
      const exists = messages.some(msg => msg._id === newMessage._id);
      if (!exists) {
        set({ messages: [...messages, newMessage] });
        console.log("Message added optimistically:", newMessage);
      }

      // Note: Backend already emits "newMessage" via Socket.IO, no need to emit again here
      console.log("Message sent via HTTP:", res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      set({ isSendingMessage: false });
    }
  },

  // ✅ Handle incoming new message
  handleNewMessage: (newMessage) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;
    if (!selectedUser || !authUser) return;

    if ((newMessage.senderId._id === selectedUser._id && newMessage.receiverId === authUser._id) ||
        (newMessage.senderId._id === authUser._id && newMessage.receiverId === selectedUser._id)) {
      // Avoid duplicates by checking if message already exists
      const exists = messages.some(msg => msg._id === newMessage._id);
      if (!exists) {
        console.log("Adding new message to UI:", newMessage);
        set({ messages: [...messages, newMessage] });
      } else {
        console.log("Message already exists, skipping:", newMessage._id);
      }
    } else {
      console.log("Message not for this conversation:", {
        senderId: newMessage.senderId?._id,
        receiverId: newMessage.receiverId,
        selectedUserId: selectedUser._id,
        authUserId: authUser._id
      });
    }
  },

  // ✅ Handle message deletion
  handleMessageDeleted: (deletedMessageId) => {
    console.log("Message deleted via socket:", deletedMessageId);
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== deletedMessageId),
    }));
  },

  // ✅ Delete a message
  deleteMessage: async (messageId) => {
    set({ isMessagesLoading: true }); // Use messages loading for now, could be a separate state
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
      toast.success("Message deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // ✅ Select a user & load their messages
  setSelectedUser: (selectedUser) => {
    const { selectedUser: currentUser } = get();
    if (currentUser?._id === selectedUser?._id) return; // Avoid re-fetching same user

    set({ selectedUser, messages: [] });
    localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    get().getMessages(selectedUser._id);
  },
}));


