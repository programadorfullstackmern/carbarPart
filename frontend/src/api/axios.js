// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    // Solo manejar errores 401
    if (response && response.status === 401) {
      // Evitar múltiples redirecciones
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        sessionStorage.setItem('sessionMessage', 'Tu sesión ha expirado');
        // Forzar recarga completa para limpiar estados
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;