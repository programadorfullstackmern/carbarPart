// ordenController.js
import Orden from '../models/Orden.js';
import Carrito from '../models/Carrito.js';
import { Auto, Pieza } from '../models/index.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// Añade esta función auxiliar en ordenController.js
const normalizeProduct = (item) => {
  // Si tenemos un producto poblado, usamos sus datos
  if (item.producto && typeof item.producto === 'object') {
    return {
      ...item.toObject ? item.toObject() : item,
      producto: {
        _id: item.producto._id,
        nombre: item.nombreProducto || item.producto.nombre || 'Producto eliminado',
        precio: item.precioUnitario,
        imagenes: [item.imagenProducto || item.producto.imagenes?.[0]].filter(Boolean)
      }
    };
  }
  
  // Para productos eliminados o no poblados
  return {
    ...item.toObject ? item.toObject() : item,
    producto: {
      _id: item.producto || 'eliminado',
      nombre: item.nombreProducto || 'Producto eliminado',
      precio: item.precioUnitario,
      imagenes: [item.imagenProducto].filter(Boolean)
    }
  };
};

export const crearOrden = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const carrito = await Carrito.findOne({ user: req.user.id }).session(session);

    if (!carrito || carrito.items.length === 0) {
      return res.status(400).json({ message: 'Carrito vacío' });
    }

    const { direccionEntrega, metodoPago } = req.body;
    if (!direccionEntrega || !metodoPago) {
      return res.status(400).json({ message: 'Faltan datos de envío o método de pago' });
    }

    const itemsOrden = [];
    for (const item of carrito.items) {
      const Model = item.tipoProducto === 'Auto' ? Auto : Pieza;
      const producto = await Model.findById(item.producto).session(session);

      if (!producto || producto.stock < item.cantidad) {
        return res.status(409).json({ 
          message: `Stock insuficiente: ${producto?.nombre || 'Producto no encontrado'}` 
        });
      }
      
      producto.stock -= item.cantidad;
      await producto.save({ session });
      
      itemsOrden.push({
        producto: item.producto,
        tipoProducto: item.tipoProducto,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        // Guardar datos redundantes
        nombreProducto: producto.nombre,
        imagenProducto: producto.imagenes?.[0] || '',
        sku: producto.sku || '',
        proveedor: producto.proveedor
      });
    }

    const numeroPedido = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const [orden] = await Orden.create([{
      user: req.user.id,
      items: itemsOrden,
      total: carrito.total,
      estado: 'pendiente',
      direccionEntrega,
      metodoPago,
      numeroPedido
    }], { session });

    await Carrito.deleteOne({ _id: carrito._id }).session(session);
    await session.commitTransaction();
    
    res.status(201).json(orden);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      message: error.message || 'Error al crear orden'
    });
  } finally {
    session.endSession();
  }
});

export const obtenerHistorial = asyncHandler(async (req, res) => {
  try {
    const ordenes = await Orden.find({ user: req.user.id })
      .populate({
        path: 'items.producto',
        select: 'nombre precio imagenes'
      })
      .sort('-createdAt');
    
    // Normalizar cada orden
    const ordenesNormalizadas = ordenes.map(orden => ({
      ...orden.toObject(),
      items: orden.items.map(normalizeProduct)
    }));
    
    res.json(ordenesNormalizadas);
  } catch (error) {
    res.status(500).json({
      message: 'Error obteniendo historial de órdenes'
    });
  }
});

export const obtenerTodasOrdenes = asyncHandler(async (req, res) => {
  try {
    const { estado } = req.query;
    const query = estado ? { estado } : {};
    
    const ordenes = await Orden.find(query)
      .populate('user', 'nombre email')
      .populate({
        path: 'items.producto',
        select: 'nombre precio imagenes'
      })
      .sort('-createdAt');
    
    // Normalizar cada orden
    const ordenesNormalizadas = ordenes.map(orden => ({
      ...orden.toObject(),
      items: orden.items.map(normalizeProduct)
    }));
    
    res.json(ordenesNormalizadas);
  } catch (error) {
    res.status(500).json({
      message: 'Error obteniendo órdenes'
    });
  }
});

export const obtenerOrdenPorId = asyncHandler(async (req, res) => {
  try {
    const orden = await Orden.findById(req.params.id)
      .populate('user', 'nombre email')
      .populate({
        path: 'items.producto',
        select: 'nombre precio imagenes'
      });

    if (!orden) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Verificar permisos
    const isAdmin = req.user.rol === 'admin';
    const isOwner = orden.user?._id.toString() === req.user.id;
    const isProvider = req.user.rol === 'proveedor';

    if (!isAdmin && !isOwner && !isProvider) {
      return res.status(403).json({ message: 'No autorizado para ver esta orden' });
    }
    
    // Para proveedores: verificar si tienen productos en esta orden
    if (isProvider) {
      const productosProveedor = await Promise.all([
        Auto.find({ proveedor: req.user.id }).select('_id'),
        Pieza.find({ proveedor: req.user.id }).select('_id')
      ]);
      
      const idsProveedor = productosProveedor.flat().map(p => p._id.toString());
      const tieneProductos = orden.items.some(item => 
        item.producto && idsProveedor.includes(item.producto.toString())
      );
      
      if (!tieneProductos) {
        return res.status(403).json({ message: 'No tienes productos en esta orden' });
      }
    }
    
    // Normalizar estructura
    const ordenNormalizada = {
      ...orden.toObject(),
      items: orden.items.map(normalizeProduct)
    };
    
    res.json(ordenNormalizada);
  } catch (error) {
    res.status(500).json({
      message: 'Error obteniendo orden'
    });
  }
});

export const actualizarEstadoOrden = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const { estado } = req.body;
    const estadosPermitidos = ['pendiente', 'procesando', 'enviada', 'entregada', 'cancelada'];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const orden = await Orden.findById(req.params.id).session(session);
    if (!orden) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Si se cancela una orden, devolver stock
    if (estado === 'cancelada' && orden.estado !== 'cancelada') {
      for (const item of orden.items) {
        const Model = item.tipoProducto === 'Auto' ? Auto : Pieza;
        const producto = await Model.findById(item.producto).session(session);
        
        if (producto) {
          producto.stock += item.cantidad;
          await producto.save({ session });
        }
      }
    }

    orden.estado = estado;
    const ordenActualizada = await orden.save({ session });
    
    await session.commitTransaction();
    
    res.json(
      await ordenActualizada.populate([
        { path: 'items.producto', select: 'nombre precio imagenes' },
        { path: 'user', select: 'nombre email' }
      ])
    );
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      message: 'Error actualizando orden'
    });
  } finally {
    session.endSession();
  }
});

export const obtenerOrdenesProveedor = asyncHandler(async (req, res) => {
  try {
    const proveedorId = req.user.id;
    
    // Buscar productos del proveedor
    const [autos, piezas] = await Promise.all([
      Auto.find({ proveedor: proveedorId }).select('_id'),
      Pieza.find({ proveedor: proveedorId }).select('_id')
    ]);
    
    const productoIds = [...autos.map(a => a._id), ...piezas.map(p => p._id)];
    
    // Buscar órdenes que contengan estos productos
    const ordenes = await Orden.aggregate([
      { $unwind: "$items" },
      { $match: { "items.producto": { $in: productoIds } } },
      {
        $group: {
          _id: "$_id",
          root: { $first: "$$ROOT" },
          items: { $push: "$items" }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$root",
              { items: "$items" }
            ]
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    
    // Poblar datos necesarios
    const ordenesPobladas = await Orden.populate(ordenes, [
      { path: 'user', select: 'nombre email' },
      { 
        path: 'items.producto', 
        select: 'nombre precio imagenes proveedor',
        model: function(doc) {
          return doc.tipoProducto === 'Auto' ? 'Auto' : 'Pieza';
        }
      }
    ]);
    
    res.json(ordenesPobladas);
  } catch (error) {
    res.status(500).json({
      message: 'Error obteniendo órdenes de proveedor'
    });
  }
});

export const actualizarEstadoOrdenProveedor = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const { estado } = req.body;
    const estadosPermitidos = ['procesando', 'enviada', 'entregada'];
    const proveedorId = req.user.id;
    
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido para proveedor' });
    }
    
    const orden = await Orden.findById(req.params.id).session(session);
    if (!orden) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    // Verificar que el proveedor tiene productos en esta orden
    const [autosProveedor, piezasProveedor] = await Promise.all([
      Auto.find({ proveedor: proveedorId }).select('_id'),
      Pieza.find({ proveedor: proveedorId }).select('_id')
    ]);
    
    const idsProveedor = [
      ...autosProveedor.map(p => p._id.toString()),
      ...piezasProveedor.map(p => p._id.toString())
    ];
    
    // Filtrar solo los items del proveedor
    const itemsProveedor = orden.items.filter(item => 
      item.producto && idsProveedor.includes(item.producto.toString())
    );
    
    if (itemsProveedor.length === 0) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar esta orden' });
    }
    
    // Actualizar solo los estados de los items del proveedor
    for (const item of itemsProveedor) {
      item.estadoProveedor = estado;
    }
    
    // Si todos los items están completos, actualizar estado general
    const todosEntregados = orden.items.every(item => 
      item.estadoProveedor === 'entregada'
    );
    
    if (todosEntregados) {
      orden.estado = 'entregada';
    }
    
    const ordenActualizada = await orden.save({ session });
    await session.commitTransaction();
    
    res.json(
      await ordenActualizada.populate([
        { path: 'items.producto', select: 'nombre precio imagenes' },
        { path: 'user', select: 'nombre email' }
      ])
    );
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      message: 'Error actualizando orden'
    });
  } finally {
    session.endSession();
  }
});