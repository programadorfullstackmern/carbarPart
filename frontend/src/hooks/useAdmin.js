// src/hooks/useAdmin.js
import { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';

export const useAdmin = () => {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    autos: 0,
    piezas: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Obtener todas las estadísticas en paralelo
      const [usersRes, ordersRes, autosRes, piezasRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getOrders(),
        adminAPI.getAllAutos(),
        adminAPI.getAllPiezas()
      ]);

      setStats({
        users: usersRes.length || 0,
        orders: ordersRes.length || 0,
        autos: autosRes.length || 0,
        piezas: piezasRes.length || 0
      });
    } catch (err) {
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  };
};