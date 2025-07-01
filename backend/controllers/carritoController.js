import Carrito from '../models/Carrito.js';
import { Auto, Pieza } from '../models/index.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

const calcularTotal = (items) => {
  return items.reduce((total, item) => total + (item.precioUnitario * item.cantidad), 0);
};

// Función auxiliar para verificar stock
const verificarStockDisponible = async (productoId, tipoProducto, cantidad, session) => {
  const Model = tipoProducto === 'Auto' ? Auto : Pieza;
  const producto = await Model.findById(productoId)
    .select('stock')
    .session(session);
  
  if (!producto) throw new Error('Producto no encontrado');
  if (producto.stock < cantidad) throw new Error('Stock insuficiente');
  
  return true;
};

export const actualizarCarrito = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    let carrito = await Carrito.findOne({ user: req.user.id }).session(session);
    
    if (!carrito) carrito = new Carrito({ user: req.user.id, items: [] });

    const { productoId, tipoProducto, cantidad } = req.body;
    
    // Validación básica
    if (cantidad <= 0) {
      res.status(400);
      throw new Error('Cantidad debe ser mayor a 0');
    }

    const Model = tipoProducto === 'Auto' ? Auto : Pieza;
    const producto = await Model.findById(productoId)
      .select('precio stock')
      .session(session);
    
    if (!producto) {
      res.status(404);
      throw new Error('Producto no existe');
    }

    // Validación de precio
    if (typeof producto.precio !== 'number' || isNaN(producto.precio)) {
      res.status(500);
      throw new Error('Precio del producto no es válido');
    }

    const itemIndex = carrito.items.findIndex(item => 
      item.producto.equals(productoId) && item.tipoProducto === tipoProducto
    );

    // CORRECCIÓN PRINCIPAL: Usar la cantidad recibida directamente
    if (itemIndex > -1) {
      // Validar stock con la NUEVA cantidad
      if (producto.stock < cantidad) {
        res.status(409);
        throw new Error('Stock insuficiente');
      }

      // ACTUALIZAR CON LA CANTIDAD RECIBIDA (no sumar)
      carrito.items[itemIndex].cantidad = cantidad;
    } else {
      // Validar stock para nuevo ítem
      if (producto.stock < cantidad) {
        res.status(409);
        throw new Error('Stock insuficiente');
      }

      // Añadir nuevo ítem
      carrito.items.push({ 
        producto: productoId, 
        tipoProducto,
        cantidad,
        precioUnitario: Number(producto.precio)
      });
    }

    carrito.total = calcularTotal(carrito.items);
    await carrito.save({ session });
    
    await session.commitTransaction();
    res.json(carrito);
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction().catch(() => {});
    }
    res.status(res.statusCode >= 400 ? res.statusCode : 500).json({
      message: error.message || 'Error en carrito'
    });
  } finally {
    if (!session.hasEnded) {
      session.endSession();
    }
  }
});

export const agregarItemCarrito = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    let carrito = await Carrito.findOne({ user: req.user.id }).session(session);
    
    // Crear carrito si no existe
    if (!carrito) {
      carrito = new Carrito({ 
        user: req.user.id, 
        items: [],
        total: 0
      });
    }

    const { productoId, tipoProducto, cantidad = 1 } = req.body;
    
    // Validaciones básicas
    if (cantidad <= 0) {
      res.status(400);
      throw new Error('Cantidad debe ser mayor a 0');
    }

    // Verificar si el producto ya está en el carrito
    const existeItem = carrito.items.some(item => 
      item.producto.equals(productoId) && item.tipoProducto === tipoProducto
    );
    
    if (existeItem) {
      res.status(400);
      throw new Error('El producto ya está en el carrito');
    }

    // Obtener detalles del producto
    const Model = tipoProducto === 'Auto' ? Auto : Pieza;
    const producto = await Model.findById(productoId)
      .select('precio stock')
      .session(session);
    
    if (!producto) {
      res.status(404);
      throw new Error('Producto no existe');
    }

    // Validar stock
    if (producto.stock < cantidad) {
      res.status(409);
      throw new Error('Stock insuficiente');
    }

    // Añadir nuevo ítem
    carrito.items.push({
      producto: productoId,
      tipoProducto,
      cantidad,
      precioUnitario: producto.precio
    });

    // Actualizar total
    carrito.total = calcularTotal(carrito.items);
    
    await carrito.save({ session });
    await session.commitTransaction();
    
    res.status(201).json(carrito);
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction().catch(() => {});
    }
    res.status(res.statusCode >= 400 ? res.statusCode : 500).json({
      message: error.message || 'Error agregando ítem al carrito'
    });
  } finally {
    if (!session.hasEnded) {
      session.endSession();
    }
  }
});

export const eliminarItemCarrito = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const { productoId, tipoProducto } = req.body;
    
    // Validación de parámetros
    if (!productoId || !tipoProducto) {
      res.status(400);
      throw new Error('Parámetros incompletos: se requiere productoId y tipoProducto');
    }

    const carrito = await Carrito.findOne({ user: req.user.id }).session(session);
    
    if (!carrito) {
      // Carrito no existe = item tampoco existe
      return res.status(200).json({
        items: [],
        total: 0
      });
    }

    const itemIndex = carrito.items.findIndex(item => 
      item.producto.equals(productoId) && item.tipoProducto === tipoProducto
    );
    
    // Si el ítem no existe, considerarlo éxito
    if (itemIndex === -1) {
      await session.commitTransaction();
      return res.status(200).json(carrito);
    }

    const item = carrito.items[itemIndex];
    
    // Revertir stock al eliminar
    const Model = tipoProducto === 'Auto' ? Auto : Pieza;
    const producto = await Model.findById(productoId).session(session);
    
    if (producto) {
      producto.stock += item.cantidad;
      await producto.save({ session });
    }

    carrito.items.splice(itemIndex, 1);
    carrito.total = calcularTotal(carrito.items);
    await carrito.save({ session });
    
    await session.commitTransaction();
    res.json(carrito);
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction().catch(() => {});
    }
    
    // Manejo de errores más informativo
    const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
    const message = error.message || 'Error eliminando ítem';
    
    console.error(`[${new Date().toISOString()}] Error eliminando ítem:`, {
      error,
      body: req.body,
      user: req.user?.id
    });
    
    res.status(statusCode).json({
      message,
      code: 'CART_ITEM_DELETION_ERROR'
    });
  } finally {
    if (session && !session.hasEnded) {
      session.endSession();
    }
  }
});

export const obtenerTodosLosCarritos = asyncHandler(async (req, res) => {
  const carritos = await Carrito.find()
    .populate({
      path: 'user',
      select: 'nombre email'
    })
    .populate({
      path: 'items.producto',
      select: 'nombre precio imagenes'
    });

  res.json(carritos);
});

// controllers/carritoController.js
export const obtenerCarrito = asyncHandler(async (req, res) => {
  const carrito = await Carrito.findOne({ user: req.user.id })
    .populate({
      path: 'items.producto',
      select: 'modelo nombre precio imagenes',
    });

  if (!carrito) {
    return res.json({ 
      _id: null,
      items: [], 
      total: 0 
    });
  }

  // Filtrar y transformar items con manejo de productos eliminados
  const items = carrito.items
    .filter(item => item.producto) // Eliminar items con producto null
    .map(item => ({
      ...item.toObject(),
      producto: {
        ...item.producto.toObject(),
        modelo: item.producto.modelo || 'Producto eliminado',
        nombre: item.producto.nombre || 'Producto eliminado',
        precio: item.producto.precio || 0,
        imagenes: item.producto.imagenes || []
      }
    }));

  // Actualizar carrito si hubo productos eliminados
  if (items.length !== carrito.items.length) {
    carrito.items = items.map(item => ({
      producto: item.producto._id,
      tipoProducto: item.tipoProducto,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario
    }));
    await carrito.save();
  }

  res.json({
    ...carrito.toObject(),
    items,
    total: calcularTotal(items) // Usar función de cálculo
  });
});

export const vaciarCarrito = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const carrito = await Carrito.findOne({ user: req.user.id }).session(session);
    
    if (!carrito) {
      return res.json({ message: 'Carrito ya está vacío' });
    }

    // Revertir stock de todos los items
    for (const item of carrito.items) {
      const Model = item.tipoProducto === 'Auto' ? Auto : Pieza;
      const producto = await Model.findById(item.producto).session(session);
      
      if (producto) {
        producto.stock += item.cantidad;
        await producto.save({ session });
      }
    }

    await Carrito.deleteOne({ _id: carrito._id }).session(session);
    await session.commitTransaction();
    res.json({ message: 'Carrito vaciado' });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction().catch(() => {});
    }
    res.status(500).json({ message: error.message });
  } finally {
    if (!session.hasEnded) {
      session.endSession();
    }
  }
});

// Nuevo endpoint para verificar stock
export const verificarStockCarrito = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const { items } = req.body;
    
    // Filtramos primero los productos que existen
    const itemsValidos = [];
    const errores = [];
    
    for (const item of items) {
      const { productoId, tipoProducto, cantidad } = item;
      const Model = tipoProducto === 'Auto' ? Auto : Pieza;
      
      // Verificar si el producto existe
      const producto = await Model.findById(productoId).session(session);
      
      if (!producto) {
        errores.push(`El producto (${tipoProducto}: ${productoId}) ya no está disponible`);
        continue;
      }
      
      // Verificar stock solo si el producto existe
      if (producto.stock < cantidad) {
        errores.push(`Stock insuficiente para ${producto.modelo || producto.nombre}`);
        continue;
      }
      
      // Si pasa ambas validaciones, agregar a items válidos
      itemsValidos.push({
        ...item,
        producto // Agregamos el objeto producto para uso posterior
      });
    }

    // Si hay errores, no continuar
    if (errores.length > 0) {
      throw new Error(errores.join('; '));
    }
    
    await session.commitTransaction();
    res.json({ 
      valido: true,
      itemsValidos
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction().catch(() => {});
    }
    res.status(409).json({ 
      message: error.message || 'Problemas con el stock',
      valido: false,
      errores: error.message.split('; ') // Convertir a array para frontend
    });
  } finally {
    if (!session.hasEnded) {
      session.endSession();
    }
  }
});