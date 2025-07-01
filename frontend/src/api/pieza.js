import api from './axios';

export const piezaAPI = {
  createPieza: async (formData) => {
    try {
      const response = await api.post('/piezas', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePieza: async (id, formData) => {
    try {
      const response = await api.put(`/piezas/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deletePieza: async (piezaId) => {
    try {
      const response = await api.delete(`/piezas/${piezaId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMyPiezas: async () => {
    try {
      const response = await api.get('/proveedores/piezas');
      return response.data.datos;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPiezaById: async (piezaId) => {
    try {
      const response = await api.get(`/piezas/${piezaId}/detalle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  linkAuto: async (piezaId, autoId) => {
    try {
      const response = await api.post(`/piezas/${piezaId}/vincular-auto/${autoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  unlinkAuto: async (piezaId, autoId) => {
    try {
      const response = await api.delete(`/piezas/${piezaId}/desvincular-auto/${autoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCompatibleAutos: async (piezaId) => {
    try {
      const response = await api.get(`/piezas/${piezaId}/autos`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  searchPiezas: async (params) => {
    try {
      const response = await api.get('/piezas', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};