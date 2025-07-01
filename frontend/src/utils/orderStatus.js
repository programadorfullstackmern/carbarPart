// src/utils/orderStatus.js
export const getStatusColor = (status) => {
  const statusMap = {
    pendiente: 'warning',
    procesando: 'primary',
    enviada: 'info',
    entregada: 'success',
    cancelada: 'danger'
  };
  
  return statusMap[status.toLowerCase()] || 'secondary';
};

export const getStatusText = (status) => {
  const statusTextMap = {
    pendiente: 'Pendiente',
    procesando: 'Procesando',
    enviada: 'Enviada',
    entregada: 'Entregada',
    cancelada: 'Cancelada'
  };
  
  return statusTextMap[status.toLowerCase()] || status;
};