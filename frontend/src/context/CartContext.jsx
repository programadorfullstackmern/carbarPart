// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { carritoAPI } from '../api/carrito';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext'; // Importamos el contexto de autenticación

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Obtenemos el usuario autenticado

  // Función para cargar el carrito
  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await carritoAPI.getCarrito();
      
      // Filtrar productos eliminados y transformar los items
      const transformedItems = (cartData.items || [])
        .filter(item => item.producto) // Filtrar productos nulos
        .map(item => ({
          id: item.producto._id,
          name: item.tipoProducto === 'Auto' 
            ? (item.producto.modelo || 'Producto eliminado') 
            : (item.producto.nombre || 'Producto eliminado'),
          price: item.precioUnitario,
          type: item.tipoProducto.toLowerCase(),
          image: item.producto.imagenes?.[0]?.url || null,
          quantity: item.cantidad
        }));
      
      setCartItems(transformedItems);
      setError(null);
      return transformedItems; // Retornar items para posible uso externo
    } catch (err) {
      setError(err.message || 'Error cargando carrito');
      toast.error('Error cargando carrito: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Cargar carrito desde el backend al iniciar y cuando cambia el usuario
  useEffect(() => {
    // Solo cargar carrito si es cliente
    if (user && user.rol === 'cliente') {
      loadCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user]);

  // Calcular total de items (suma de cantidades)
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calcular total del carrito (suma de precios)
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity, 0
  );

  const addToCart = async (item) => {
    try {
      const existingItem = cartItems.find(
        i => i.id === item.id && i.type === item.type
      );
      
      let newItem;
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        newItem = { ...existingItem, quantity: newQuantity };
        
        await carritoAPI.updateItem({
          id: existingItem.id,
          type: existingItem.type,
          quantity: newQuantity
        });
      } else {
        newItem = { ...item, quantity: 1 };
        await carritoAPI.addItem(newItem);
      }

      // Actualizar estado local
      setCartItems(prev => 
        existingItem 
          ? prev.map(i => 
              i.id === item.id && i.type === item.type 
                ? newItem 
                : i
            )
          : [...prev, newItem]
      );

      // Notificación de éxito
      toast.success(
        <div>
          <strong>{item.name}</strong>
          <div>¡Agregado al carrito!</div>
          <small className="text-muted">
            Ahora tienes {totalItems + 1} productos
          </small>
        </div>,
        {
          icon: '🛒',
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#4BB543',
            color: '#fff',
            minWidth: '300px',
          },
        }
      );
    } catch (err) {
      toast.error(`Error: ${err.message}`, {
        style: {
          background: '#FF0033',
          color: '#fff',
        }
      });
      throw err;
    }
  };

  const updateQuantity = async (id, type, quantity) => {
    try {
      if (quantity < 1) {
        await removeFromCart(id, type);
        return;
      }
      
      await carritoAPI.updateItem({ 
        id, 
        type, 
        quantity
      });
      
      setCartItems(prev => 
        prev.map(item => 
          item.id === id && item.type === type 
            ? { ...item, quantity } 
            : item
        )
      );

      toast.success('Cantidad actualizada');
    } catch (err) {
      toast.error(`Error actualizando cantidad: ${err.message}`);
    }
  };

  const removeFromCart = async (id, type) => {
    try {
      await carritoAPI.deleteItem(id, type);
      
      setCartItems(prev => 
        prev.filter(item => !(item.id === id && item.type === type))
      );

      toast.success('Producto eliminado del carrito', {
        icon: '❌',
      });
    } catch (err) {
      if (err.message.includes('no existe en carrito')) {
        // Forzar recarga del carrito desde el backend
        const cartData = await carritoAPI.getCarrito();
        
        const transformedItems = (cartData.items || [])
          .filter(item => item.producto)
          .map(item => ({
            id: item.producto._id,
            name: item.tipoProducto === 'Auto' 
              ? (item.producto.modelo || 'Producto eliminado') 
              : (item.producto.nombre || 'Producto eliminado'),
            price: item.precioUnitario,
            type: item.tipoProducto.toLowerCase(),
            image: item.producto.imagenes?.[0]?.url || null,
            quantity: item.cantidad
          }));
        
        setCartItems(transformedItems);
        
        toast.info('El carrito se ha actualizado', {
          icon: '🔄',
        });
      } else {
        toast.error(`Error eliminando producto: ${err.message}`);
        throw err;
      }
    }
  };

  const clearCart = async () => {
    try {
      await carritoAPI.vaciarCarrito();
      setCartItems([]);
      toast.success('Carrito vaciado correctamente', {
        icon: '🗑️',
      });
    } catch (err) {
      toast.error(`Error vaciando carrito: ${err.message}`);
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loading,
        error,
        loadCart // Exportamos la función para recargar el carrito
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);