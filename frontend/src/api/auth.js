import api from './axios';

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      const status = error.response?.status;
      let errorMessage = errorData.message || error.message;
      let errorType = 'general';
      
      // Determinar tipo de error basado en status code
      if (status === 404) {
        errorType = 'user_not_found';
        errorMessage = 'Usuario no encontrado';
      } else if (status === 401) {
        errorType = 'invalid_credentials';
        errorMessage = 'Credenciales incorrectas';
      }
      
      throw {
        message: errorMessage,
        type: errorType
      };
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/auth/perfil');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  updateProfile: async (updates) => {
    try {
      const response = await api.put('/auth/perfil', updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};