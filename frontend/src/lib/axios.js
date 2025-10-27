//axios mean for making http requests and handling responses from the server , it simplifies the process of interacting with backend APIs by providing an easy-to-use interface for sending requests and receiving data. It also handles the conversion of data to and from JSON format, which is a common format for transmitting data over the network.  

//zustand is a small, fast and scalable bearbones state-management solution using simplified flux principles. It provides a minimalistic API for managing application state in a predictable way, making it easy to create and maintain complex applications with a clear separation of concerns.

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // to include cookies in cross-origin requests
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Add request timeout and retry logic can be added here
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.response?.data?.message || error.message
        });

        if (error.response?.status === 401 && !error.config.url.includes('/auth/check-auth')) {
            // Clear any stored auth data
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            console.warn('🚫 Forbidden access');
        } else if (error.response?.status >= 500) {
            console.error('🔥 Server error occurred');
        }

        return Promise.reject(error);
    }
);
