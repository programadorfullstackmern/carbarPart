import api from './axios';
import axios from 'axios';

export const ordenAPI = {
  /**
   * Crea una nueva orden
   * @param {Object} orderData - Datos de la orden a crear
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  createOrder: async (orderData) => {
    try {
      // Validación básica de campos requeridos
      if (!orderData.direccionEntrega || !orderData.metodoPago) {
        throw new Error('Faltan datos de envío o método de pago');
      }

      // Limpieza de datos
      const cleanData = {
        items: orderData.items.map(item => ({
          productoId: item.productoId,
          tipoProducto: item.tipoProducto,
          cantidad: item.cantidad
        })),
        total: orderData.total,
        direccionEntrega: orderData.direccionEntrega,
        metodoPago: orderData.metodoPago
      };

      const response = await api.post('/ordenes', cleanData);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return;
      
      const errorMessage = error.response?.data?.message || 
                          error.message || // Captura errores de validación frontend
                          'Error creando la orden. Por favor intente nuevamente.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene todas las órdenes (para administradores)
   * @returns {Promise<Array>} - Lista de órdenes
   */
  getOrders: async () => {
    try {
      const response = await api.get('/ordenes');
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      
      const errorMessage = error.response?.data?.message || 
                          'Error obteniendo las órdenes. Por favor intente nuevamente.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene una orden por su ID
   * @param {string} orderId - ID de la orden
   * @returns {Promise<Object>} - Datos de la orden
   */
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/ordenes/${orderId}`, {
        timeout: 10000 // Agregar timeout para evitar demoras
      });
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return null;
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tiempo de espera agotado al obtener la orden');
      }
      
      // Manejo especial para orden no encontrada
      if (error.response?.status === 404) {
        throw new Error('La orden solicitada no fue encontrada');
      }
      
      const errorMessage = error.response?.data?.message || 
                          'Error obteniendo la orden. Por favor intente nuevamente.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza el estado de una orden
   * @param {string} orderId - ID de la orden
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.patch(`/ordenes/admin/${orderId}/estado`, { estado: status });
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return;
      
      const errorMessage = error.response?.data?.message || 
                          'Error actualizando el estado. Por favor intente nuevamente.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene las órdenes para el proveedor actual con manejo de rutas alternativas
   * @returns {Promise<Array>} - Lista de órdenes del proveedor
   */
  getProviderOrders: async () => {
    try {
      // Primero intentar con la ruta más común (singular)
      try {
        const response = await api.get('/proveedores/ordenes');
        return response.data.datos;
      } catch (firstError) {
       
        // Si es 404, probar con ruta alternativa (plural)
        if (firstError.response?.status === 404) {
          try {
            const response = await api.get('/proveedores/ordenes');
            return response.data.datos;
          } catch (secondError) {
            // Manejar el segundo error
            throw secondError;
          }
        }
        // Si no es 404, relanzar el primer error
        throw firstError;
      }
    } catch (error) {
      // Manejar cancelación
      if (axios.isCancel(error) || error.isCanceled) return [];
      
      // Manejar específicamente error 403 (prohibido)
      if (error.response?.status === 403) {
        throw new Error('No tienes permiso para ver estas órdenes');
      }
      
      // Manejar específicamente error 404 (no encontrado)
      if (error.response?.status === 404) {
        console.warn('Endpoint de órdenes de proveedor no disponible');
        return []; // Retornar array vacío como fallback
      }
      
      // Otros errores
      const errorMessage = error.response?.data?.message || 
                          'Error obteniendo las órdenes. Por favor intente nuevamente.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene todas las órdenes (para administradores)
   * @returns {Promise<Array>} - Lista completa de órdenes
   */
  getAdminOrders: async () => {
    try {
      const response = await api.get('/ordenes/admin');
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      
      // Manejar específicamente error 403 (prohibido)
      if (error.response?.status === 403) {
        throw new Error('Acceso no autorizado a las órdenes administrativas');
      }
      
      const errorMessage = error.response?.data?.message || 
                          'Error obteniendo las órdenes administrativas.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene las órdenes del usuario actual (para clientes)
   * @returns {Promise<Array>} - Lista de órdenes del usuario
   */
  getUserOrders: async () => {
    try {
      // Cambiamos a la ruta base '/ordenes' que usa el token del usuario
      const response = await api.get('/ordenes');
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      
      // Manejar específicamente error 403 (prohibido)
      if (error.response?.status === 403) {
        throw new Error('No tienes permiso para ver estas órdenes');
      }
      
      const errorMessage = error.response?.data?.message || 
                          'Error obteniendo tus órdenes. Por favor intente nuevamente.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza el estado de una orden (para proveedores)
   * @param {string} orderId - ID de la orden
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  updateProviderOrderStatus: async (orderId, status) => {
    try {
      // Primero intentar con la ruta singular
      try {
        const response = await api.patch(`/proveedor/ordenes/${orderId}/estado`, { estado: status });
        return response.data;
      } catch (firstError) {
        // Si es 404, probar con ruta alternativa (plural)
        if (firstError.response?.status === 404) {
          try {
            const response = await api.patch(`/proveedores/ordenes/${orderId}/estado`, { estado: status });
            return response.data;
          } catch (secondError) {
            // Manejar el segundo error
            throw secondError;
          }
        }
        // Si no es 404, relanzar el primer error
        throw firstError;
      }
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return;
      
      // Manejar específicamente error 403 (prohibido)
      if (error.response?.status === 403) {
        throw new Error('No tienes permiso para actualizar esta orden');
      }
      
      // Manejar específicamente error 404 (no encontrado)
      if (error.response?.status === 404) {
        throw new Error('La orden solicitada no fue encontrada');
      }
      
      const errorMessage = error.response?.data?.message || 
                          'Error actualizando el estado de la orden. Por favor intente nuevamente.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene órdenes por estado (para administradores)
   * @param {string} status - Estado de las órdenes a buscar
   * @returns {Promise<Array>} - Lista de órdenes filtradas por estado
   */
  getOrdersByStatus: async (status) => {
    try {
      const response = await api.get(`/ordenes/admin/estado/${status}`);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      
      const errorMessage = error.response?.data?.message || 
                          `Error obteniendo órdenes con estado ${status}.`;
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene órdenes de un cliente específico (para administradores)
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} - Lista de órdenes del usuario
   */
  getOrdersByUser: async (userId) => {
    try {
      const response = await api.get(`/ordenes/admin/usuario/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      
      const errorMessage = error.response?.data?.message || 
                          'Error obteniendo las órdenes del usuario.';
      throw new Error(errorMessage);
    }
  }
};