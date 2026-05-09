import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import axios from "axios";
import { useAuthStore, User } from "./useAuthStore";
import DOMPurify from "dompurify";

export interface Message {
  _id: string;
  senderId: User | string;
  receiverId: string;
  message: string;
  attachments: { type: string, url: string }[];
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  messages: Message[];
  users: User[];
  onlineUsers: string[];
  typingUsers: string[];
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSendingMessage: boolean;

  setUsers: (users: User[]) => void;
  setOnlineUsers: (onlineUsers: string[]) => void;
  getUsers: () => Promise<void>;
  getMessages: (userId: string, options?: { signal?: AbortSignal }) => Promise<void>;
  sendMessage: (messageData: { message: string, imageUrl?: string }) => Promise<void>;
  handleNewMessage: (newMessage: Message) => void;
  handleMessageDeleted: (deletedMessageId: string) => void;
  handleMessageRead: (messageId: string, readAt: string) => void;
  deleteMessage: (messageId: string) => Promise<void>;
  handleTyping: (senderId: string) => void;
  handleStopTyping: (senderId: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  markMessageAsRead: (messageId: string) => Promise<void>;
  setSelectedUser: (selectedUser: User | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  users: [],
  onlineUsers: [],
  typingUsers: [],

  setUsers: (users) => set({ users }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data.users || [] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId, options = {}) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`, {
        signal: options.signal,
      });
      set({ messages: res.data || [] });
    } catch (error: any) {
      if (axios.isCancel(error)) return;
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, handleNewMessage } = get();
    if (!selectedUser?._id) return toast.error("No user selected!");

    set({ isSendingMessage: true });
    try {
      const sanitizedMessage = DOMPurify.sanitize(messageData.message);
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        { ...messageData, message: sanitizedMessage }
      );

      handleNewMessage(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      set({ isSendingMessage: false });
    }
  },

  handleNewMessage: (newMessage) => {
    set((state) => {
      const { selectedUser, messages } = state;
      if (selectedUser && (
        (typeof newMessage.senderId === 'string' ? newMessage.senderId : newMessage.senderId._id) === selectedUser._id || 
        newMessage.receiverId === selectedUser._id
      )) {
        const messageExists = messages.some(msg => msg._id === newMessage._id);
        if (!messageExists) {
          return {
            messages: [...messages, newMessage],
          };
        }
      }
      return state;
    });
  },

  handleMessageDeleted: (deletedMessageId) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== deletedMessageId),
    }));
  },

  handleMessageRead: (messageId, readAt) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, isRead: true, readAt } : msg
      ),
    }));
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      get().handleMessageDeleted(messageId);
      toast.success("Message deleted successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

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

  startTyping: () => {
    const { selectedUser } = get();
    const socket = (useAuthStore.getState() as any).socket;
    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });
    }
  },

  stopTyping: () => {
    const { selectedUser } = get();
    const socket = (useAuthStore.getState() as any).socket;
    if (socket && selectedUser) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
  },

  markMessageAsRead: async (messageId) => {
    try {
      await axiosInstance.patch(`/messages/read/${messageId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to mark message as read");
    }
  },

  setSelectedUser: (selectedUser) => {
    const { selectedUser: currentUser } = get();
    if (currentUser?._id === selectedUser?._id) return;

    set({ selectedUser, messages: [], typingUsers: [] });
    if (selectedUser) {
      get().getMessages(selectedUser._id);
    }
  },
}));
