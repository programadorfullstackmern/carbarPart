import api from './axios';
import axios from 'axios';

export const adminAPI = {
  registerUser: async (userData) => {
    try {
      const response = await api.post('/admin/registro', userData);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return;
      throw error.response?.data?.message || error.message || 'Error registrando usuario';
    }
  },

  getUsers: async () => {
    try {
      const response = await api.get('/admin/usuarios');
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error obteniendo usuarios';
    }
  },

  getClients: async () => {
    try {
      const response = await api.get('/admin/usuarios/clientes');
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error obteniendo clientes';
    }
  },

  getProviders: async () => {
    try {
      const response = await api.get('/admin/usuarios/proveedores');
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error obteniendo proveedores';
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/usuarios/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error obteniendo usuario por ID';
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/admin/usuarios/${userId}`, userData);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error actualizando usuario';
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/usuarios/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error eliminando usuario';
    }
  },

  getOrders: async () => {
    try {
      const response = await api.get('/ordenes/admin');
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error obteniendo ordenes';
    }
  },

  getOrderDetails: async (orderId) => {
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
      
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      
      throw error.response?.data?.message || error.message || 'Error obteniendo orden por ID';
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.patch(`/ordenes/admin/${orderId}/estado`, { estado: status });
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return null;
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error actualizando estado de orden';
    }
  },

  getOrdersByStatus: async (status) => {
    try {
      const response = await api.get(`/ordenes/admin/estado/${status}`);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error obteniendo order por status';
    }
  },

  getAllAutos: async () => {
    try {
      const response = await api.get('/autos/todos');
      return response.data.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error obteniendo autos';
    }
  },

  getAutosByProveedor: async (proveedorId) => {
    try {
      const response = await api.get(`/proveedores/${proveedorId}/autos`);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error obteniendo autos por proveedor';
    }
  },

  getAllPiezas: async () => {
    try {
      const response = await api.get('/piezas/todas');
      return response.data.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error obteniendo piezas';
    }
  },

  getPiezasByProveedor: async (proveedorId) => {
    try {
      const response = await api.get(`/proveedores/${proveedorId}/piezas`);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error obteniendo piezas por proveedor';
    }
  },

  getProveedorById: async (proveedorId) => {
    try {
      const response = await api.get(`/admin/usuarios/${proveedorId}`);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error) || error.isCanceled) return [];
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }
      throw error.response?.data?.message || error.message || 'Error obteniendo proveedor por Id';
    }
  }
};