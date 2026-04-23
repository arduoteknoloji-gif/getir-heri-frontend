import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://getir-heri.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Her istekte token otomatik eklenir
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 gelince logout yönlendirmesi için interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
      // NavigationRef üzerinden login'e yönlendir
    }
    return Promise.reject(error);
  }
);

export default api;