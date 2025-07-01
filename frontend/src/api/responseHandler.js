/**
 * Maneja la respuesta de la API y extrae datos y paginación
 * @param {Object} response - Respuesta de la API
 * @returns {Object} { data, pagination }
 */
export const handleApiResponse = (response) => {
  if (!response) {
    throw new Error('Respuesta vacía del servidor');
  }
  
  // Respuesta exitosa con datos
  if (response.success) {
    return {
      data: response.data || response.datos || [],
      pagination: {
        page: response.pagina || 1,
        total: response.total || 0,
        totalPages: response.paginas || 1,
        limit: response.limit || response.limite || 10
      }
    };
  }
  
  // Respuesta con error
  throw new Error(response.message || 'Error en la respuesta del servidor');
};