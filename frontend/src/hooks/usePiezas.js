import { useState, useEffect } from 'react';
import { piezaAPI } from '../api/pieza';

const usePiezas = (role) => {
  const [piezas, setPiezas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPiezas = async () => {
    try {
      setLoading(true);
      const data = role === 'proveedor' 
        ? await piezaAPI.getMyPiezas()
        : await piezaAPI.searchPiezas({});
      setPiezas(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar piezas');
      setPiezas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPiezas();
  }, []);

  const createPieza = async (piezaData) => {
    try {
      const newPieza = await piezaAPI.createPieza(piezaData);
            console.log('createPieza', newPieza)
      // Actualizar estado local y luego recargar desde servidor
      setPiezas(prev => [...prev, newPieza]);
      await fetchPiezas(); // Recarga los datos actualizados
      return newPieza;
    } catch (err) {
      throw err;
    }
  };

  const updatePieza = async (id, piezaData) => {
    try {
      const updatedPieza = await piezaAPI.updatePieza(id, piezaData);
      // Actualizar estado local y luego recargar desde servidor
      setPiezas(prev => prev.map(pieza => 
        pieza._id === id ? {...pieza, ...updatedPieza} : pieza
      ));
      await fetchPiezas(); // Recarga los datos actualizados
      return updatedPieza;
    } catch (err) {
      throw err;
    }
  };

  const deletePieza = async (id) => {
    try {
      await piezaAPI.deletePieza(id);
      // Actualizar estado local y luego recargar desde servidor
      setPiezas(prev => prev.filter(pieza => pieza._id !== id));
      await fetchPiezas(); // Recarga los datos actualizados
    } catch (err) {
      throw err;
    }
  };

  return {
    piezas,
    loading,
    error,
    createPieza,
    updatePieza,
    deletePieza,
    fetchPiezas // Exportar para recargas manuales
  };
};

export default usePiezas;