// src/utils/formatters.js
export const formatCurrency = (value) => {
  // Manejar casos donde value podría ser null/undefined/NaN
  const safeValue = Number(value) || 0;
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(safeValue);
};

// Función adicional para formato de fecha si es necesario
export const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};