import React, { createContext, useContext, useState, useEffect } from 'react';
import { autoAPI } from '../api/auto';
import { piezaAPI } from '../api/pieza';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [autos, setAutos] = useState([]);
  const [piezas, setPiezas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [autosData, piezasData] = await Promise.all([
        autoAPI.getAutosDisponibles(),
        piezaAPI.getPiezasDisponibles()
      ]);
      setAutos(autosData);
      setPiezas(piezasData);
    } catch (err) {
      setError(err.message || 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ 
      autos, 
      piezas,
      loading,
      error,
      refreshProducts: loadProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);