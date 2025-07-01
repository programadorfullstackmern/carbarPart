import React, { createContext, useContext, useState, useEffect } from 'react';
import { carritoAPI } from '../api/carrito';
import { ordenAPI } from '../api/orden';
import { useAuth } from './AuthContext';

const ClientContext = createContext();

export const ClientProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCartItems: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  const [notifications, setNotifications] = useState([]);

  // Cargar carrito y órdenes al iniciar
  useEffect(() => {
    if (user) {
      loadCart();
      loadOrders();
    }
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await carritoAPI.getCarrito();
      setCart(cartData);
      setStats(prev => ({
        ...prev,
        totalCartItems: cartData.items?.length || 0
      }));
    } catch (err) {
      setError(err.message || 'Error cargando carrito');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await ordenAPI.getOrdenesByCliente();
      setOrders(ordersData);
      
      const pending = ordersData.filter(o => o.estado === 'pendiente').length;
      setStats({
        totalCartItems: cart.items?.length || 0,
        totalOrders: ordersData.length,
        pendingOrders: pending
      });
      
      // Notificaciones
      const newNotifications = [];
      if (pending > 0) {
        newNotifications.push({
          id: 1,
          message: `Tienes ${pending} órdenes pendientes`,
          type: 'warning'
        });
      }
      setNotifications(newNotifications);
    } catch (err) {
      setError(err.message || 'Error cargando órdenes');
    } finally {
      setLoading(false);
    }
  };

  // Operaciones de carrito
  const addToCart = async (product) => {
    try {
      setLoading(true);
      await carritoAPI.agregarItem({
        productoId: product._id,
        tipo: product.tipo, // 'auto' o 'pieza'
        cantidad: 1
      });
      await loadCart();
    } catch (err) {
      throw err.response?.data || err.message;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, cantidad) => {
    try {
      setLoading(true);
      await carritoAPI.actualizarItem(itemId, { cantidad });
      await loadCart();
    } catch (err) {
      throw err.response?.data || err.message;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      await carritoAPI.eliminarItem(itemId);
      await loadCart();
    } catch (err) {
      throw err.response?.data || err.message;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await carritoAPI.limpiarCarrito();
      setCart({ items: [] });
      setStats(prev => ({ ...prev, totalCartItems: 0 }));
    } catch (err) {
      throw err.response?.data || err.message;
    } finally {
      setLoading(false);
    }
  };

  // Operaciones de órdenes
  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      const newOrder = await ordenAPI.crearOrden(orderData);
      await loadCart();
      await loadOrders();
      return newOrder;
    } catch (err) {
      throw err.response?.data || err.message;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      setLoading(true);
      await ordenAPI.cancelarOrden(orderId);
      await loadOrders();
    } catch (err) {
      throw err.response?.data || err.message;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientContext.Provider value={{
      cart,
      orders,
      stats,
      notifications,
      loading,
      error,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      createOrder,
      cancelOrder,
      loadCart,
      loadOrders
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => useContext(ClientContext);