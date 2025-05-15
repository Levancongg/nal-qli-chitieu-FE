import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const authApi = {
  login: async (username: string, password: string) => {
    
    const response = await api.post('/v1/auth/login', { username, password });
    return response.data;
  },

  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await api.post('/v1/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const refreshToken = Cookies.get('refreshToken');
    
    const response = await api.post('/v1/auth/logout', {
      token: refreshToken
    });
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/v1/auth/refresh');
    return response.data;
  },
};

// User APIs
export const userApi = {
  getAllUsers: async () => {
    const response = await api.get('/v1/user');
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/v1/user/${id}`);
    return response.data;
  },
};

// Add axios interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        await authApi.refreshToken();
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api; 