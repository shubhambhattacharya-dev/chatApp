import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // to include cookies in cross-origin requests
    timeout: 30000, // increased timeout to 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        if (import.meta.env.DEV) {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        if (import.meta.env.DEV) {
            console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        // Don't log cancellation errors, as they are expected.
        if (axios.isCancel(error)) {
            return Promise.reject(error);
        }

        const isCheckAuth401 = error.response?.status === 401 && error.config.url.includes('/auth/check-auth');

        if (import.meta.env.DEV) {
            // Don't log 401 from check-auth as a full-blown error, it's an expected state.
            if (!isCheckAuth401) {
                console.error('❌ API Error:', {
                    status: error.response?.status,
                    url: error.config?.url,
                    message: error.response?.data?.message || error.message
                });
            }
        }

        if (error.response?.status === 401 && !isCheckAuth401) {
            // Delegate logout to the auth store to handle cleanup and redirection
            useAuthStore.getState().logout();
        } else if (error.response?.status === 403) {
            console.warn('🚫 Forbidden access');
        } else if (error.response?.status >= 500) {
            console.error('🔥 Server error occurred');
        }

        return Promise.reject(error);
    }
);
