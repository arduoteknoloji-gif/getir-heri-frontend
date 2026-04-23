import axios from 'axios';

const API_URL = "https://getir-heri.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

let isRedirecting = false;

// İstek öncesi token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Yanıt hatası yönetimi (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.clear();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?error=expired';
      }
      setTimeout(() => { isRedirecting = false; }, 3000);
    }
    return Promise.reject(error);
  }
);

export default api;
