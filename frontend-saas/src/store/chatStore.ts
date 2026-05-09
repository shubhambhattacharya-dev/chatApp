import { create } from "zustand";
import axios from "axios";

export interface Message {
  _id: string;
  senderId: { _id: string; username: string; fullName: string; profilePic?: string } | string;
  receiverId: { _id: string; username: string; fullName: string; profilePic?: string } | string;
  message?: string;
  attachments?: Array<{ url: string; publicId: string }>;
  isRead: boolean;
  createdAt: string;
}

interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  profilePic?: string;
  isOnline?: boolean;
}

interface ChatState {
  users: User[];
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  messages: Message[];
  typingUsers: string[];
  onlineUsers: string[];
  
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (receiverId: string, message: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  markMessageAsRead: (messageId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  messages: [],
  typingUsers: [],
  onlineUsers: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axios.get("/api/messages/users", {
        withCredentials: true,
      });
      set({ users: response.data.users });
    } catch (error) {
      console.error("Failed to get users:", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axios.get(`/api/messages/user/${userId}`, {
        withCredentials: true,
        params: { userId },
      });
      set({ messages: response.data.messages });
    } catch (error) {
      console.error("Failed to get messages:", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (receiverId: string, message: string) => {
    try {
      const response = await axios.post(
        "/api/messages/send",
        { receiverId, message },
        { withCredentials: true }
      );
      set({ messages: [...get().messages, response.data.message] });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      await axios.delete(`/api/messages/${messageId}`, {
        withCredentials: true,
      });
      set({ messages: get().messages.filter((m) => m._id !== messageId) });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user }),

  markMessageAsRead: async (messageId: string) => {
    try {
      await axios.patch(`/api/messages/${messageId}/read`, {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  },
}));