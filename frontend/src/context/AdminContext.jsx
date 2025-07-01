import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../api/admin';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

const initialState = {
  users: [],
  orders: [],
  autos: [],
  piezas: [],
  stats: {
    clients: 0,
    providers: 0,
    admins: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalOrders: 0,
    availableAutos: 0,
    totalAutos: 0,
    availablePiezas: 0,
    totalPiezas: 0
  },
  loading: true,
  error: null,
  createUser: () => {},
  updateUser: () => {},
  deleteUser: () => {},
  loadData: () => {},
  getUsers: () => [],
  updateOrderStatus: () => {},
  getOrderDetails: () => {}
};

const AdminContext = createContext(initialState);

export const AdminProvider = ({ children }) => {
  const [users, setUsers] = useState(initialState.users);
  const [orders, setOrders] = useState(initialState.orders);
  const [autos, setAutos] = useState(initialState.autos);
  const [piezas, setPiezas] = useState(initialState.piezas);
  const [stats, setStats] = useState(initialState.stats);
  const [loading, setLoading] = useState(initialState.loading);
  const [error, setError] = useState(initialState.error);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, ordersData, autosData, piezasData] = await Promise.allSettled([
        adminAPI.getUsers().catch(() => []),
        adminAPI.getOrders().catch(() => []),
        adminAPI.getAllAutos().catch(() => []),
        adminAPI.getAllPiezas().catch(() => [])
      ]);

      const resolvedUsers = usersData.status === 'fulfilled' ? usersData.value : [];
      const resolvedOrders = ordersData.status === 'fulfilled' ? ordersData.value : [];
      const resolvedAutos = autosData.status === 'fulfilled' ? autosData.value : [];
      const resolvedPiezas = piezasData.status === 'fulfilled' ? piezasData.value : [];

      setUsers(resolvedUsers);
      setOrders(resolvedOrders);
      setAutos(resolvedAutos);
      setPiezas(resolvedPiezas);

      updateStats({
        users: resolvedUsers,
        orders: resolvedOrders,
        autos: resolvedAutos,
        piezas: resolvedPiezas
      });

      const errors = [
        usersData.status === 'rejected' && usersData.reason,
        ordersData.status === 'rejected' && ordersData.reason,
        autosData.status === 'rejected' && autosData.reason,
        piezasData.status === 'rejected' && piezasData.reason
      ].filter(Boolean);

      if (errors.length > 0) {
        const errorMessages = errors.map(e => e.message || String(e));
        setError(`Errores parciales: ${errorMessages.join(', ')}`);
      }
    } catch (err) {
      setError(err.message || 'Error cargando datos administrativos');
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };

  const updateStats = (data) => {
    const statsData = {
      clients: (data.users || []).filter(u => u.rol === 'cliente').length,
      providers: (data.users || []).filter(u => u.rol === 'proveedor').length,
      admins: (data.users || []).filter(u => u.rol === 'admin').length,
      totalUsers: (data.users || []).length,
      pendingOrders: (data.orders || []).filter(o => o.estado === 'pendiente').length,
      totalOrders: (data.orders || []).length,
      availableAutos: (data.autos || []).filter(a => a.disponible).length,
      totalAutos: (data.autos || []).length,
      availablePiezas: (data.piezas || []).filter(p => p.stock > 0).length,
      totalPiezas: (data.piezas || []).length,
    };
    setStats(statsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createUser = async (userData) => {
    try {
      const newUser = await adminAPI.registerUser(userData);
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      updateStats({ users: updatedUsers, orders, autos, piezas });
      return newUser;
    } catch (err) {
      setError(err.message || 'Error al crear usuario');
      throw err;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const cleanUserData = Object.fromEntries(
        Object.entries(userData).filter(([_, v]) => v !== '')
      );
      
      const updatedUser = await adminAPI.updateUser(userId, cleanUserData);
      const updatedUsers = users.map(u => u._id === userId ? {...u, ...updatedUser} : u);
      
      setUsers(updatedUsers);
      updateStats({ users: updatedUsers, orders, autos, piezas });
      
      return updatedUser;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Error al actualizar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await adminAPI.deleteUser(userId);
      const updatedUsers = users.filter(u => u._id !== userId);
      setUsers(updatedUsers);
      updateStats({ users: updatedUsers, orders, autos, piezas });
    } catch (err) {
      setError(err.message || 'Error al eliminar usuario');
      throw err;
    }
  };

  const getOrderDetails = useCallback(async (orderId, options = {}) => {
    try {
      const cachedOrder = orders.find(o => o._id === orderId);
      if (cachedOrder && cachedOrder.items) {
        return cachedOrder;
      }
      
      const orderDetails = await adminAPI.getOrderDetails(orderId, options);
      return orderDetails;
    } catch (error) {
      console.error("Error obteniendo detalles de orden:", error);
      throw error;
    }
  }, [orders]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      setLoading(true);
      await adminAPI.updateOrderStatus(orderId, status);
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, estado: status } : order
        )
      );
      
      if (status === 'pendiente' || status === 'entregada') {
        updateStats({
          users,
          orders: orders.map(o => o._id === orderId ? {...o, estado: status} : o),
          autos,
          piezas
        });
      }
    } catch (error) {
      console.error("Error actualizando estado de orden:", error);
      setError(error.message || 'Error actualizando estado de la orden');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
        <p className="ms-3">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <AdminContext.Provider
      value={{
        users,
        orders,
        autos,
        piezas,
        stats,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        loadData,
        getUsers: () => adminAPI.getUsers(),
        getOrderDetails,
        updateOrderStatus
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  
  if (context === undefined) {
    throw new Error('useAdmin debe usarse dentro de un AdminProvider');
  }
  
  return context;
};