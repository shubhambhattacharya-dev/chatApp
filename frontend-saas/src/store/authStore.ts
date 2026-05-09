import { create } from "zustand";
import axios from "axios";

const API_URL = "/api/auth";

interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  profilePic?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  createdAt?: Date;
}

interface AuthState {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isCheckingAuth: boolean;
  error: string | null;
  
  signup: (data: { fullName: string; email: string; password: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  error: null,

  signup: async (data) => {
    set({ isSigningUp: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/signup`, data, {
        withCredentials: true,
      });
      set({ authUser: response.data.user });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Signup failed";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, data, {
        withCredentials: true,
      });
      set({ authUser: response.data.user });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    } finally {
      set({ authUser: null });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axios.get(`${API_URL}/check`, {
        withCredentials: true,
      });
      set({ authUser: response.data.user });
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));