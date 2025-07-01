// src/api/provider.js
import api from './axios';

// Este archivo contiene funciones específicas para el rol de proveedor
// que no están cubiertas por otros archivos (auto, pieza)

export const providerAPI = {
  // Ejemplo: función para actualizar perfil del proveedor
  updateProfile: async (updates) => {
    try {
      const response = await api.put('/proveedores/perfil', updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Otras funciones específicas para el proveedor podrían ir aquí
  // Por ejemplo: estadísticas, reportes, etc.
  
  // Función para obtener estadísticas de ventas
  getSalesStats: async () => {
    try {
      const response = await api.get('/proveedores/estadisticas/ventas');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Función para obtener estadísticas de productos
  getProductStats: async () => {
    try {
      const response = await api.get('/proveedores/estadisticas/productos');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Función para obtener notificaciones
  getNotifications: async () => {
    try {
      const response = await api.get('/proveedores/notificaciones');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};