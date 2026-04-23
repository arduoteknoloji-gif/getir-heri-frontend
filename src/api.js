import axios from 'axios';

const api = axios.create({
  baseURL: 'https://getir-heri.onrender.com/api',
});

// Her istekte token'ı otomatik ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Token'ı nerede saklıyorsan oradan al
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;