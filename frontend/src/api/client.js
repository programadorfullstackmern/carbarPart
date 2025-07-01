// src/api/client.js
import api from './axios';

// Este archivo contiene funciones específicas para el rol de cliente
// que no están cubiertas por otros archivos (carrito, ordenes, etc.)

export const clientAPI = {
  // Ejemplo: función para actualizar perfil del cliente
  updateProfile: async (updates) => {
    try {
      const response = await api.put('/clientes/perfil', updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Otras funciones específicas para el cliente podrían ir aquí
  // Por ejemplo: obtener direcciones, métodos de pago, etc.
  
  // Función para obtener favoritos (si existiera en el backend)
  getFavorites: async () => {
    try {
      const response = await api.get('/clientes/favoritos');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Función para agregar a favoritos
  addFavorite: async (productId, productType) => {
    try {
      const response = await api.post('/clientes/favoritos', {
        productoId: productId,
        tipoProducto: productType
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Función para eliminar de favoritos
  removeFavorite: async (favoriteId) => {
    try {
      const response = await api.delete(`/clientes/favoritos/${favoriteId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};