// Formatear fecha
export const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

// Formatear moneda
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Acortar texto
export const shortenText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Función segura para búsqueda: convierte a string y a minúsculas, maneja nulos/undefined
export const safeSearch = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.toLowerCase();
  return String(value).toLowerCase();
};

// Función para obtener el primer error de un objeto de errores
export const getFirstError = (errors) => {
  const keys = Object.keys(errors);
  if (keys.length > 0) {
    return errors[keys[0]];
  }
  return '';
};