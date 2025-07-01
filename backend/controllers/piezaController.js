import Pieza from '../models/Pieza.js';
import Auto from '../models/Auto.js';
import asyncHandler from 'express-async-handler';
import { limpiarImagenesTemp } from '../middlewares/uploadMiddleware.js';
import { MENSAJES, HTTP_CODES, CONFIG } from '../utils/constants.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import { parseSort } from '../utils/queryHelpers.js';

const actualizarAutosVinculados = async (piezaId, autosIds) => {
  try {
    await Auto.updateMany(
      { _id: { $in: autosIds } },
      { $addToSet: { piezasCompatibles: piezaId } }
    );
  } catch (error) {
    console.error(`${MENSAJES.ERROR.VALIDACION_DB_ERROR}: ${error.message}`);
  }
};


export const crearPieza = asyncHandler(async (req, res) => {
  try {
    const { nombre, precio, stock, autosCompatibles = '[]' } = req.body;
    
    // Validación de precio
    const precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      await limpiarImagenesTemp(req.uploadedFiles);
      return res.status(HTTP_CODES.BAD_REQUEST).json({ 
        success: false,
        message: MENSAJES.ERROR.PRECIO_INVALIDO
      });
    }

    // Validar duplicados
    const existe = await Pieza.findOne({ 
      nombre: { $regex: new RegExp(`^${nombre}$`, 'i') },
      proveedor: req.user.id 
    }).collation({ locale: 'es', strength: 2 }).lean();

    if (existe) {
      await limpiarImagenesTemp(req.uploadedFiles);
      return res.status(HTTP_CODES.CONFLICT).json({ 
        success: false,
        message: MENSAJES.ERROR.DUPLICADO_ERROR
      });
    }

    // Procesar autos compatibles
    let autosIds = [];
    try {
      autosIds = JSON.parse(autosCompatibles);
      if (!Array.isArray(autosIds)) throw new Error();
    } catch (error) {
      await limpiarImagenesTemp(req.uploadedFiles);
      return res.status(HTTP_CODES.BAD_REQUEST).json({ 
        success: false,
        message: MENSAJES.ERROR.AUTOS_INVALIDOS
      });
    }

    // Crear pieza
    const pieza = await Pieza.create({
      nombre: nombre.trim(),
      precio: parseFloat(precioNum.toFixed(2)),
      stock: Math.min(stock, CONFIG.PAGINACION.MAX_STOCK),
      proveedor: req.user.id,
      imagenes: req.uploadedFiles || [],
      autosCompatibles: autosIds
    });

    // Actualizar autos vinculados
    if (autosIds.length > 0) {
      process.nextTick(async () => {
        try {
          await actualizarAutosVinculados(pieza._id, autosIds);
        } catch (error) {
          console.error(MENSAJES.ERROR.VALIDACION_DB_ERROR, error);
        }
      });
    }

    res.status(HTTP_CODES.CREATED).json({
      success: true,
      data: {
        _id: pieza._id,
        nombre: pieza.nombre,
        precio: pieza.precio,
        stock: pieza.stock,
        imagenes: pieza.imagenes.map(img => ({
          url: img.url,
          id: img.public_id
        }))
      },
      message: MENSAJES.EXITO.PIEZA_CREADA
    });

  } catch (error) {
    await limpiarImagenesTemp(req.uploadedFiles);
    res.status(HTTP_CODES.SERVER_ERROR).json({ 
      success: false,
      message: MENSAJES.ERROR.VALIDACION_DB_ERROR
    });
  }
});

export const actualizarPieza = asyncHandler(async (req, res) => {
  try {
    const pieza = await Pieza.findById(req.params.id).lean();
    
    if (!pieza) {
      return res.status(HTTP_CODES.NOT_FOUND).json({ 
        success: false,
        message: MENSAJES.ERROR.RECURSO_NO_ENCONTRADO
      });
    }

    // Validar permisos
    if (pieza.proveedor.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(HTTP_CODES.FORBIDDEN).json({ 
        success: false,
        message: MENSAJES.ERROR.ACCION_NO_AUTORIZADA
      });
    }

    const actualizaciones = { ...req.body };
    const nuevasImagenes = req.uploadedFiles || [];
    const imagenesAEliminar = [];

    // 1. Procesar imágenes existentes
    let existingImagenes = [];
    try {
      if (req.body.existingImagenes) {
        existingImagenes = JSON.parse(req.body.existingImagenes);
      }
    } catch (error) {
      console.error("Error parsing existingImagenes:", error);
    }

    // 2. Combinar con nuevas imágenes
    actualizaciones.imagenes = [
      ...existingImagenes,
      ...nuevasImagenes
    ];

    // 3. Manejo de imágenes a eliminar
    if (req.body.imagenesEliminar) {
      try {
        const idsEliminar = JSON.parse(req.body.imagenesEliminar);
        if (!Array.isArray(idsEliminar)) throw new Error();
        
        actualizaciones.imagenes = actualizaciones.imagenes
          .filter(img => !idsEliminar.includes(img.public_id));
        
        imagenesAEliminar.push(...idsEliminar);
      } catch (error) {
        await limpiarImagenesTemp(nuevasImagenes);
        return res.status(HTTP_CODES.BAD_REQUEST).json({ 
          success: false,
          message: MENSAJES.ERROR.IMAGENES_ELIMINAR_FORMATO
        });
      }
    }

    // 4. Validar máximo de imágenes
    if (actualizaciones.imagenes.length > CONFIG.IMAGENES.MAX_IMAGENES) {
      await limpiarImagenesTemp(nuevasImagenes);
      return res.status(HTTP_CODES.BAD_REQUEST).json({ 
        success: false,
        message: MENSAJES.ERROR.MAX_IMAGENES
      });
    }

    // 5. Actualizar otros campos
    if (req.body.nombre) actualizaciones.nombre = req.body.nombre.trim();
    
    if (req.body.precio !== undefined) {
      const nuevoPrecio = Number(req.body.precio);
      if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
        await limpiarImagenesTemp(nuevasImagenes);
        return res.status(HTTP_CODES.BAD_REQUEST).json({ 
          success: false,
          message: MENSAJES.ERROR.PRECIO_INVALIDO
        });
      }
      actualizaciones.precio = parseFloat(nuevoPrecio.toFixed(2));
    }
    
    if (req.body.stock) {
      actualizaciones.stock = Math.min(
        Number(req.body.stock), 
        CONFIG.PAGINACION.MAX_STOCK
      );
    }
    
    // 6. Actualizar autos compatibles
    if (req.body.autosCompatibles) {
      try {
        const autosIds = JSON.parse(req.body.autosCompatibles);
        if (!Array.isArray(autosIds)) throw new Error();
        actualizaciones.autosCompatibles = autosIds;
      } catch (error) {
        await limpiarImagenesTemp(nuevasImagenes);
        return res.status(HTTP_CODES.BAD_REQUEST).json({ 
          success: false,
          message: MENSAJES.ERROR.AUTOS_INVALIDOS
        });
      }
    }

    // 7. Actualizar en base de datos
    const piezaActualizada = await Pieza.findByIdAndUpdate(
      req.params.id,
      actualizaciones,
      { new: true, runValidators: true }
    ).lean();

    // 8. Eliminar imágenes en background
    if (imagenesAEliminar.length > 0) {
      setTimeout(async () => {
        try {
          await Promise.all(
            imagenesAEliminar.map(publicId => 
              cloudinary.uploader.destroy(publicId)
          ));
        } catch (error) {
          console.error(MENSAJES.ADVERTENCIAS.IMAGENES_ELIMINADAS, error);
        }
      }, 0);
    }

    res.status(HTTP_CODES.OK).json({
      success: true,
      data: piezaActualizada,
      message: MENSAJES.EXITO.PIEZA_ACTUALIZADA
    });

  } catch (error) {
    await limpiarImagenesTemp(req.uploadedFiles);
    res.status(HTTP_CODES.SERVER_ERROR).json({ 
      success: false,
      message: MENSAJES.ERROR.VALIDACION_DB_ERROR
    });
  }
});

export const eliminarPieza = asyncHandler(async (req, res, next) => {
  try {
    const pieza = await Pieza.findById(req.params.id);

    if (!pieza) {
      return res.status(HTTP_CODES.NOT_FOUND).json({ 
        success: false,
        message: MENSAJES.ERROR.RECURSO_NO_ENCONTRADO
      });
    }

    // Validar permisos
    if (pieza.proveedor.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(HTTP_CODES.FORBIDDEN).json({ 
        success: false,
        message: MENSAJES.ERROR.ACCION_NO_AUTORIZADA
      });
    }

    // Eliminar imágenes
    if (pieza.imagenes.length > 0) {
      await Promise.all(
        pieza.imagenes.map(async (img) => {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id, { invalidate: true });
          }
        })
      );
    }

    // Actualizar autos compatibles
    if (pieza.autosCompatibles.length > 0) {
      await Auto.updateMany(
        { _id: { $in: pieza.autosCompatibles } },
        { $pull: { piezasCompatibles: pieza._id } }
      );
    }

    await Pieza.deleteOne({ _id: pieza._id });

    res.status(HTTP_CODES.OK).json({ 
      success: true,
      message: MENSAJES.EXITO.PIEZA_ELIMINADA
    });

  } catch (error) {
    next(error);
  }
});

export const buscarPiezas = asyncHandler(async (req, res) => {
  const { 
    q,
    nombre,
    nombreExacto,
    nombres,
    stockMin,
    stockMax,
    precioMin,
    precioMax,
    proveedor,
    autosCompatibles,
    pagina = 1,
    limite = 20,
    sort = '-createdAt'
  } = req.query;

  // Validación de parámetros numéricos
  const page = Math.max(1, parseInt(pagina)) || 1;
  const limit = Math.min(100, Math.max(1, parseInt(limite))) || 20;

  const query = { deleted: { $ne: true } };
  const options = {
    page,
    limit,
    select: '-__v',
    populate: [
      {
        path: 'proveedor',
        select: 'nombre email',
        match: { deleted: { $ne: true } }
      },
      {
        path: 'autosCompatibles',
        select: 'modelo anio precio',
        match: { deleted: { $ne: true } }
      }
    ],
    lean: true
  };

  // 1. Búsqueda full-text
  if (q) {
    if (q.length < 3) {
      return res.status(400).json({
        success: false,
        code: 'QUERY_TOO_SHORT',
        message: 'La búsqueda requiere al menos 3 caracteres'
      });
    }
    
    query.$text = { $search: q };
    
    // Manejar proyección como objeto
    if (options.select) {
      if (typeof options.select === 'string') {
        options.select = { [options.select.replace('-', '')]: 0 };
      }
    } else {
      options.select = {};
    }
    
    options.select.score = { $meta: 'textScore' };
    options.sort = { 
      score: { $meta: 'textScore' },
      ...parseSort(sort)
    };
  } else {
    options.sort = parseSort(sort);
  }

  // 2. Filtros de nombre
  if (nombreExacto) {
    query.nombre = { $regex: `^${nombreExacto}$`, $options: 'i' };
  } else if (nombres) {
    query.nombre = { $in: nombres.split(',') };
  } else if (nombre) {
    query.nombre = { $regex: nombre, $options: 'i' };
  }

  // 3. Filtros numéricos
  const addRangeFilter = (field, min, max) => {
    if (min || max) {
      query[field] = {};
      const minVal = Number(min);
      const maxVal = Number(max);
      if (min && !isNaN(minVal)) query[field].$gte = minVal;
      if (max && !isNaN(maxVal)) query[field].$lte = maxVal;
    }
  };

  addRangeFilter('stock', stockMin, stockMax);
  addRangeFilter('precio', precioMin, precioMax);

  // 4. Filtro por proveedor
  if (proveedor) {
    if (!mongoose.Types.ObjectId.isValid(proveedor)) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        success: false,
        code: 'INVALID_PROVIDER_ID',
        message: MENSAJES.ERROR.PROVEEDOR_INVALIDO
      });
    }
    query.proveedor = proveedor;
  }

  // 5. Filtro por autos compatibles
  if (autosCompatibles) {
    const autosArray = autosCompatibles.split(',');
    const invalidIds = autosArray.filter(id => !mongoose.Types.ObjectId.isValid(id));
    
    if (invalidIds.length > 0) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        success: false,
        code: 'INVALID_CAR_ID',
        message: MENSAJES.ERROR.AUTO_INVALIDO,
        invalidIds
      });
    }
    
    query.autosCompatibles = { $in: autosArray };
  }

  try {
    const resultados = await Pieza.paginate(query, options);

    const response = {
      success: true,
      count: resultados.docs.length,
      total: resultados.totalDocs,
      paginas: resultados.totalPages,
      pagina: resultados.page,
      data: resultados.docs.map(doc => ({
        ...doc,
        precio: doc.precio ? parseFloat(doc.precio.toFixed(2)) : null
      }))
    };

    res.status(HTTP_CODES.OK).json(response);
  } catch (error) {
    handleSearchError(res, error, 'PIEZA');
  }
});

export const vincularAuto = asyncHandler(async (req, res) => {
  const { piezaId, autoId } = req.params;
  
  const [pieza, auto] = await Promise.all([
    Pieza.findById(piezaId),
    Auto.findById(autoId)
  ]);

  if (!pieza || !auto) {
    return res.status(HTTP_CODES.NOT_FOUND).json({ 
      success: false,
      message: MENSAJES.ERROR.RECURSO_NO_ENCONTRADO
    });
  }

  // Validar permisos para ambos recursos
  if (pieza.proveedor.toString() !== req.user.id) {
    return res.status(HTTP_CODES.FORBIDDEN).json({ 
      success: false,
      message: MENSAJES.ERROR.ACCION_NO_AUTORIZADA
    });
  }

  if (auto.proveedor.toString() !== req.user.id) {
    return res.status(HTTP_CODES.FORBIDDEN).json({ 
      success: false,
      message: MENSAJES.ERROR.ACCION_NO_AUTORIZADA
    });
  }

  try {
    // Actualizar ambos documentos en paralelo
    const [piezaActualizada, autoActualizado] = await Promise.all([
      Pieza.findByIdAndUpdate(
        piezaId,
        { $addToSet: { autosCompatibles: autoId } },
        { new: true, runValidators: true }
      ).select('-proveedor -__v'),
      
      Auto.findByIdAndUpdate(
        autoId,
        { $addToSet: { piezasCompatibles: piezaId } },
        { new: true, runValidators: true }
      ).select('-proveedor -__v')
    ]);

    res.status(HTTP_CODES.OK).json({
      success: true,
      data: {
        pieza: piezaActualizada,
        auto: autoActualizado
      },
      message: MENSAJES.EXITO.VINCULACION_EXITOSA
    });
  } catch (error) {
    res.status(HTTP_CODES.SERVER_ERROR).json({
      success: false,
      message: MENSAJES.ERROR.VALIDACION_DB_ERROR
    });
  }
});

export const desvincularAuto = asyncHandler(async (req, res) => {
  const { piezaId, autoId } = req.params;

  const [pieza, auto] = await Promise.all([
    Pieza.findById(piezaId),
    Auto.findById(autoId)
  ]);

  if (!pieza || !auto) {
    return res.status(HTTP_CODES.NOT_FOUND).json({ 
      success: false,
      message: MENSAJES.ERROR.RECURSO_NO_ENCONTRADO
    });
  }

  // Validar permisos para ambos recursos
  if (pieza.proveedor.toString() !== req.user.id) {
    return res.status(HTTP_CODES.FORBIDDEN).json({ 
      success: false,
      message: MENSAJES.ERROR.ACCION_NO_AUTORIZADA
    });
  }

  // FIX: Se agregó validación faltante para el auto
  if (auto.proveedor.toString() !== req.user.id) {
    return res.status(HTTP_CODES.FORBIDDEN).json({ 
      success: false,
      message: MENSAJES.ERROR.ACCION_NO_AUTORIZADA
    });
  }

  try {
    // Actualizar ambos documentos en paralelo
    const [piezaActualizada, autoActualizado] = await Promise.all([
      Pieza.findByIdAndUpdate(
        piezaId,
        { $pull: { autosCompatibles: autoId } },
        { new: true, runValidators: true }
      ).select('-proveedor -__v'),
      
      Auto.findByIdAndUpdate(
        autoId,
        { $pull: { piezasCompatibles: piezaId } },
        { new: true, runValidators: true }
      ).select('-proveedor -__v')
    ]);

    res.status(HTTP_CODES.OK).json({
      success: true,
      data: {
        pieza: piezaActualizada,
        auto: autoActualizado
      },
      message: MENSAJES.EXITO.DESVINCULACION_EXITOSA
    });
  } catch (error) {
    res.status(HTTP_CODES.SERVER_ERROR).json({
      success: false,
      message: MENSAJES.ERROR.VALIDACION_DB_ERROR
    });
  }
});

export const listarAutosCompatibles = asyncHandler(async (req, res) => {
  try {
    const pieza = await Pieza.findById(req.params.id)
      .populate({
        path: 'autosCompatibles',
        select: 'modelo anio precio imagenes',
        match: { deleted: { $ne: true } }
      });

    if (!pieza) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        success: false,
        message: MENSAJES.ERROR.RECURSO_NO_ENCONTRADO
      });
    }

    // Filtrar autos no eliminados y transformar imágenes
    const autos = pieza.autosCompatibles
      .filter(auto => auto !== null)
      .map(auto => ({
        ...auto._doc,
        imagenes: auto.imagenes.map(img => ({
          url: img.url,
          id: img.public_id
        }))
      }));

    res.status(HTTP_CODES.OK).json({
      success: true,
      count: autos.length,
      data: {
        ...pieza.toObject(),
        autosCompatibles: autos
      }
    });

  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(HTTP_CODES.SERVER_ERROR).json({
      success: false,
      message: MENSAJES.ERROR.SERVER_ERROR,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export const listarTodasPiezas = asyncHandler(async (req, res) => {
  try {
    const piezas = await Pieza.find({})
      .select('nombre precio stock imagenes proveedor')
      .populate({
        path: 'proveedor',
        select: 'nombre email',
        match: { deleted: { $ne: true } }
      })
      .lean();

    const respuesta = piezas.map(pieza => ({
      ...pieza,
      proveedor: pieza.proveedor || { nombre: "Proveedor no disponible" },
      precio: pieza.precio ? parseFloat(pieza.precio.toFixed(2)) : null,
      imagenes: pieza.imagenes.map(img => ({
        url: img.url,
        id: img.public_id
      }))
    }));

    res.status(HTTP_CODES.OK).json({
      success: true,
      count: respuesta.length,
      data: respuesta
    });

  } catch (error) {
    res.status(HTTP_CODES.SERVER_ERROR).json({
      success: false,
      message: MENSAJES.ERROR.SERVER_ERROR
    });
  }
});

// piezaController.js
// ... (código existente)

export const getPiezaById = asyncHandler(async (req, res) => {
  try {
    const piezaId = req.params.id;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(piezaId)) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        success: false,
        message: MENSAJES.ERROR.ID_INVALIDO
      });
    }

    // Buscar pieza con populate
    const pieza = await Pieza.findById(piezaId)
      .populate('proveedor', 'nombre email')
      .populate('autosCompatibles', 'modelo anio precio imagenes')
      .lean();

    if (!pieza) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        success: false,
        message: MENSAJES.ERROR.RECURSO_NO_ENCONTRADO
      });
    }

    // Formatear imágenes
    pieza.imagenes = pieza.imagenes.map(img => ({
      url: img.url,
      id: img.public_id
    }));

    // Formatear autos compatibles
    pieza.autosCompatibles = pieza.autosCompatibles.map(auto => ({
      ...auto,
      imagenes: auto.imagenes.map(img => ({
        url: img.url,
        id: img.public_id
      }))
    }));

    res.status(HTTP_CODES.OK).json({
      success: true,
      data: pieza
    });

  } catch (error) {
    console.error(`Error al obtener pieza: ${error.message}`);
    res.status(HTTP_CODES.SERVER_ERROR).json({
      success: false,
      message: MENSAJES.ERROR.SERVER_ERROR
    });
  }
});