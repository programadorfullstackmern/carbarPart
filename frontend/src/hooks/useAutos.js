import { useState, useEffect } from 'react';
import { autoAPI } from '../api/auto';

const useAutos = (role) => {
  const [autos, setAutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAutos = async () => {
    try {
      setLoading(true);
      const data = role === 'proveedor' 
        ? await autoAPI.getMyAutos()
        : await autoAPI.searchAutos({});
      setAutos(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar autos');
      setAutos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutos();
  }, []);

  const createAuto = async (autoData) => {
    try {
      const newAuto = await autoAPI.createAuto(autoData);
      // Actualizar estado local y luego recargar desde servidor
      setAutos(prev => [...prev, newAuto]);
      await fetchAutos(); // Recarga los datos actualizados
      return newAuto;
    } catch (err) {
      throw err;
    }
  };

  const updateAuto = async (id, autoData) => {
    try {
      const updatedAuto = await autoAPI.updateAuto(id, autoData);
      // Actualizar estado local y luego recargar desde servidor
      setAutos(prev => prev.map(auto => auto._id === id ? {...auto, ...updatedAuto} : auto));
      await fetchAutos(); // Recarga los datos actualizados
      return updatedAuto;
    } catch (err) {
      throw err;
    }
  };

  const deleteAuto = async (id) => {
    try {
      await autoAPI.deleteAuto(id);
      // Actualizar estado local y luego recargar desde servidor
      setAutos(prev => prev.filter(auto => auto._id !== id));
      await fetchAutos(); // Recarga los datos actualizados
    } catch (err) {
      throw err;
    }
  };

  return {
    autos,
    loading,
    error,
    createAuto,
    updateAuto,
    deleteAuto,
    fetchAutos // Exportar para recargas manuales
  };
};

export default useAutos;