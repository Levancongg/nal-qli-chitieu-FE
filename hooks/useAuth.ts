import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';

interface User {
  id: string;
  username: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      const response = await authApi.login(username, password);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData: { username: string; email: string; password: string }) => {
    try {
      setError(null);
      const response = await authApi.register(userData);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      // Xóa token từ cookie
      Cookies.remove('authToken');
      Cookies.remove('refreshToken');
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      // Ngay cả khi có lỗi, vẫn xóa token và state
      Cookies.remove('authToken');
      Cookies.remove('refreshToken');
      setUser(null);
      setError(err.response?.data?.message || 'Logout failed');
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // You might want to add an endpoint to check current user
        // const response = await api.get('/v1/auth/me');
        // setUser(response.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };
}; 