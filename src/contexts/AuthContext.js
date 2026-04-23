import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = "https://getir-heri.onrender.com/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim(),
        password: password
      });

      const data = response.data;

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        toast.success('Giriş başarılı!');
        return { success: true, data: data };
      } else {
        toast.error(data.message || 'Giriş başarısız');
        return { success: false, error: data.message };
      }
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.message || 'Sunucuya bağlanılamıyor';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email: registerData.email.trim(),
        password: registerData.password,
        name: registerData.name.trim(),
        role: registerData.role,
        phone: registerData.phone?.trim() || undefined,
        restaurant_name: registerData.restaurant_name?.trim() || undefined,
        latitude: registerData.latitude,
        longitude: registerData.longitude
      });

      const data = response.data;

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        toast.success('Kayıt başarılı!');
        return { success: true, data: data };
      } else {
        toast.error(data.message || 'Kayıt başarısız');
        return { success: false, error: data.message };
      }
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.message || 'Sunucuya bağlanılamıyor';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      toast.info('Çıkış yapıldı');
    }
  }, [token]);

  const updateUserStatus = async (status) => {
    if (!user?._id) return { success: false };
    
    try {
      const response = await axios.patch(
        `${API_URL}/couriers/${user._id}/status`,
        { status },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const updatedUser = { ...user, status };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Durum güncellenemedi');
    }
    return { success: false };
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUserStatus,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}