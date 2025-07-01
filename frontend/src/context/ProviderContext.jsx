import React, { createContext, useContext, useState, useEffect } from 'react';
import { autoAPI } from '../api/auto';
import { piezaAPI } from '../api/pieza';
import { ordenAPI } from '../api/orden';
import { useAuth } from './AuthContext';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

const ProviderContext = createContext();

export const ProviderProvider = ({ children }) => {
  const [autos, setAutos] = useState([]);
  const [piezas, setPiezas] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalAutos: 0,
    totalPiezas: 0,
    totalOrders: 0,
    pendingOrders: 0
  }); // Inicializar con valores por defecto
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, authState } = useAuth();

  // Verificar si el usuario es proveedor
  const isProvider = user?.rol === 'proveedor';

  const loadData = async () => {
    if (!isProvider) {
      setError('Acceso denegado: se requieren permisos de proveedor');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Cargar datos en paralelo
      const [autosResponse, piezasResponse, ordersResponse] = await Promise.allSettled([
        autoAPI.getMyAutos(),
        piezaAPI.getMyPiezas(),
        ordenAPI.getProviderOrders().catch(() => []) // Fallback para errores
      ]);
      
      // Extraer valores de las respuestas
      const autosData = autosResponse.status === 'fulfilled' ? autosResponse.value : [];
      const piezasData = piezasResponse.status === 'fulfilled' ? piezasResponse.value : [];
      const ordersData = ordersResponse.status === 'fulfilled' ? ordersResponse.value : [];

      
      // Actualizar estados
      setAutos(autosData);
      setPiezas(piezasData);
      setOrders(ordersData);
      
      // Calcular estadísticas
      const totalAutos = autosData.length;
      const totalPiezas = piezasData.length;
      const totalOrders = ordersData.length;
      const pendingOrders = ordersData.filter(order => order.estado === 'pendiente').length;

      setStats({
        totalAutos,
        totalPiezas,
        totalOrders,
        pendingOrders
      });
      
      // Manejar errores individuales
      const errors = [
        autosResponse.status === 'rejected' && autosResponse.reason,
        piezasResponse.status === 'rejected' && piezasResponse.reason,
        ordersResponse.status === 'rejected' && ordersResponse.reason,
      ].filter(Boolean);
      
      if (errors.length > 0) {
        setError(`Errores parciales: ${errors.map(e => e.message).join(', ')}`);
      }
      
    } catch (err) {
      setError(err.message || 'Error cargando datos del proveedor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authState.status === 'authenticated') {
      loadData();
    } else {
      setLoading(false);
    }
  }, [authState.status]);

  // Mostrar estados de carga/error
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
        <span className="ms-2">Cargando datos del proveedor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!isProvider) {
    return (
      <div className="container mt-5 text-center">
        <Alert variant="danger">
          No tienes permisos de proveedor para acceder a esta sección
        </Alert>
      </div>
    );
  }

  return (
    <ProviderContext.Provider value={{ 
      autos,
      piezas,
      orders,
      stats,
      loading,
      error,
      loadData,
      isProvider
    }}>
      {children}
    </ProviderContext.Provider>
  );
};

export const useProvider = () => useContext(ProviderContext);