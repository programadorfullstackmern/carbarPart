// src/api/carrito.js
import api from './axios';

export const carritoAPI = {
getCarrito: async () => {
  try {
    const response = await api.get('/carrito');
    // Asegurar que siempre retorne un objeto con items array
    return response.data || { items: [] };
  } catch (error) {
    // Retornar estructura vacía en caso de error
    console.error("Error fetching cart:", error);
    return { items: [] };
  }
},

  updateCarrito: async (item) => {
    try {
      const response = await api.put('/carrito', item);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // src/api/carrito.js
deleteItem: async (id, type) => {
  try {
    const response = await api.delete('/carrito/items', {
      data: {
        productoId: id,
        tipoProducto: type === 'auto' ? 'Auto' : 'Pieza'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
},

  addItem: async (item) => {
    try {
      const response = await api.post('/carrito/items', {
        productoId: item.id,
        tipoProducto: item.type === 'auto' ? 'Auto' : 'Pieza',
        cantidad: item.quantity || 1
      });
      console.log('addItem', response.data)
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateItem: async (item) => {
    try {
      // CORRECCIÓN: Cambiar la ruta a '/carrito'
      const response = await api.put('/carrito', {
        productoId: item.id,
        tipoProducto: item.type === 'auto' ? 'Auto' : 'Pieza',
        cantidad: item.quantity
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  vaciarCarrito: async () => {
    try {
      const response = await api.delete('/carrito');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // src/api/carrito.js
verificarStock: async (items) => {
  try {
    const response = await api.post('/carrito/verificar-stock', { 
      items: items.map(item => ({
        productoId: item.id,
        tipoProducto: item.type === 'auto' ? 'Auto' : 'Pieza',
        cantidad: item.quantity
      }))
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}
};