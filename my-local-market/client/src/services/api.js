// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const customerToken = localStorage.getItem('customerToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`;
  }

  return config;
});


export default api;
