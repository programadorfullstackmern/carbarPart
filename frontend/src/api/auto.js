import api from './axios';

export const autoAPI = {
  createAuto: async (formData) => {
    try {
      const response = await api.post('/autos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateAuto: async (id, formData) => {
    try {
      const response = await api.put(`/autos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteAuto: async (autoId) => {
    try {
      const response = await api.delete(`/autos/${autoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMyAutos: async () => {
    try {
      const response = await api.get('/proveedores/autos');
      return response.data.datos;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAutoById: async (autoId) => {
    try {
      const response = await api.get(`/autos/${autoId}/detalle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  linkPieza: async (autoId, piezaId) => {
    try {
      const response = await api.post(`/autos/${autoId}/vincular-pieza/${piezaId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  unlinkPieza: async (autoId, piezaId) => {
    try {
      const response = await api.delete(`/autos/${autoId}/desvincular-pieza/${piezaId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCompatiblePiezas: async (autoId) => {
    try {
      const response = await api.get(`/autos/${autoId}/piezas`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  searchAutos: async (params) => {
    try {
      const response = await api.get('/autos', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};