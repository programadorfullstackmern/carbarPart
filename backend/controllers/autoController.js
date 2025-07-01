import Auto from '../models/Auto.js';
import Pieza from '../models/Pieza.js';
import asyncHandler from 'express-async-handler';
import { limpiarImagenesTemp } from '../middlewares/uploadMiddleware.js';
import { MENSAJES, HTTP_CODES, CONFIG } from '../utils/constants.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import { parseSort } from '../utils/queryHelpers.js';

const actualizarPiezasCompatibles = async (autoId, piezasIds) => {
  try {
    await Pieza.updateMany(
      { _id: { $in: piezasIds } },
      { $addToSet: { autosCompatibles: autoId } }
    );
  } catch (error) {
    console.error(`${MENSAJES.ERROR.VALIDACION_DB_ERROR}: ${error.message}`);
  }
};


export const crearAuto = asyncHandler(async (req, res, next) => {
  try {
    const { modelo, anio, precio, piezasCompatibles = '[]' } = req.body;
    
    // Validación básica con precio
    if (!modelo || !anio || precio === undefined) {
      await limpiarImagenesTemp(req.uploadedFiles);
      return res.status(HTTP_CODES.BAD_REQUEST).json({ 
        success: false,
        message: `${MENSAJES.ERROR.MODELO_REQUERIDO}, ${MENSAJES.ERROR.ANIO_REQUERIDO}, ${MENSAJES.ERROR.PRECIO_REQUERIDO}`
      });
    }

    // Validación numérica
    const añoNumerico = Number(anio);
    if (isNaN(añoNumerico)) {
      await limpiarImagenesTemp(req.uploadedFiles);
      return res.status(HTTP_CODES.BAD_REQUEST).json({ 
        success: false,
        message: MENSAJES.ERROR.ANIO_FORMATO
      });
    }

    // Validación de rango para año
    if (añoNumerico < CONFIG.ANIO.MIN || añoNumerico > CONFIG.ANIO.MAX) {
      await limpiarImagenesTemp(req.uploadedFiles);
      return res.status(HTTP_CODES.BAD_REQUEST).json({ 
        success: false,
        message: MENSAJES.ERROR.ANIO_INVALIDO
      });
    }

    // Validación de precio
    const precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum < CONFIG.PRECIO.MIN || precioNum > CONFIG.PRECIO.MAX) {
      await limpiarImagenesTemp(req.uploadedFiles);
      return res.status(HTTP_CODES.BAD_REQUEST).json({ 
        success: false,
        message: MENSAJES.ERROR.PRECIO_INVALIDO
      });
    }

    // Validación de imágenes
    if (req.uploadedFiles?.length > CONFIG.IMAGENES.MAX_IMAGENES) {
      await limpiarImagenesTemp(req.uploadedFiles);
      return res.status(HTTP_CODES.BAD_REQUEST).json({ 
        success: false,
        message: MENSAJES.ERROR.MAX_IMAGENES
      });
    }

    // Verificación de duplicados
    const existe = await Auto.findOne({
      modelo: { $regex: new RegExp(`^${modelo}$`, 'i') },
      anio: añoNumerico,
      proveedor: req.user.id
    }).collation({ locale: 'en', strength: 2 }).lean();

    if (existe) {
      await limpiarImagenesTemp(req.uploadedFiles);
      return res.status(HTTP_CODES.CONFLICT).json({ 
        success: false,
        message: MENSAJES.ERROR.DUPLICADO_ERROR
      });
    }

    // Procesar piezas
    let piezasIds = [];
    try {
      piezasIds = JSON.parse(piezasCompatibles);
      if (!Array.isArray(piezasIds)) throw new Error();
    } catch (error) {
      await limpiarImagenesTemp(req.uploadedFiles);
      return res.status(HTTP_CODES.BAD_REQUEST).json({ 
        success: false,
        message: MENSAJES.ERROR.PIEZAS_INVALIDAS
      });
    }

    // Crear auto con precio
    const auto = await Auto.create({
      modelo: modelo.trim(),
      anio: añoNumerico,
      precio: precioNum,
      proveedor: req.user.id,
      imagenes: req.uploadedFiles || [],
      piezasCompatibles: piezasIds
    });

    // Actualización en background
    if (piezasIds.length > 0) {
      process.nextTick(async () => {
        try {
          await actualizarPiezasCompatibles(auto._id, piezasIds);
        } catch (error) {
          console.error(MENSAJES.ERROR.VALIDACION_DB_ERROR, error);
        }
      });
    }

    res.status(HTTP_CODES.CREATED).json({
      success: true,
      data: {
        _id: auto._id,
        modelo: auto.modelo,
        anio: auto.anio,
        precio: auto.precio,
        imagenes: auto.imagenes.map(img => ({
          url: img.url,
          id: img.public_id
        })),
        piezasCompatibles: auto.piezasCompatibles
      },
      message: MENSAJES.EXITO.AUTO_CREADO
    });

  } catch (error) {
    await limpiarImagenesTemp(req.uploadedFiles);
    next(error);
  }
});

export const actualizarAuto = asyncHandler(async (req, res, next) => {
  try {
    const auto = await Auto.findById(req.params.id).lean();

    if (!auto) {
      return res.status(HTTP_CODES.NOT_FOUND).json({ 
        success: false,
        message: MENSAJES.ERROR.RECURSO_NO_ENCONTRADO
      });
    }

    // Validar permisos
    if (auto.proveedor.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(HTTP_CODES.FORBIDDEN).json({ 
        success: false,
        message: MENSAJES.ERROR.ACCION_NO_AUTORIZADA
      });
    }

    const actualizaciones = { ...req.body };
    const nuevasImagenes = req.uploadedFiles || [];
    const imagenesAEliminar = [];

    // Validación numérica para año
    if (req.body.anio) {
      actualizaciones.anio = Number(req.body.anio);
      if (isNaN(actualizaciones.anio)) {
        await limpiarImagenesTemp(nuevasImagenes);
        return res.status(HTTP_CODES.BAD_REQUEST).json({ 
          success: false,
          message: MENSAJES.ERROR.ANIO_FORMATO
        });
      }
    }

    // Validación de precio
    if (req.body.precio !== undefined) {
      actualizaciones.precio = Number(req.body.precio);
      if (isNaN(actualizaciones.precio) || 
         actualizaciones.precio < CONFIG.PRECIO.MIN || 
         actualizaciones.precio > CONFIG.PRECIO.MAX) {
        await limpiarImagenesTemp(nuevasImagenes);
        return res.status(HTTP_CODES.BAD_REQUEST).json({ 
          success: false,
          message: MENSAJES.ERROR.PRECIO_INVALIDO
        });
      }
    }

    // Procesar imágenes existentes
    let existingImagenes = [];
    try {
      if (req.body.existingImagenes) {
        existingImagenes = JSON.parse(req.body.existingImagenes);
      }
    } catch (error) {
      console.error("Error parsing existingImagenes:", error);
    }

    // Combinar con nuevas imágenes
    actualizaciones.imagenes = [
      ...existingImagenes,
      ...(req.uploadedFiles || [])
    ];

    // Manejo de imágenes
    if (nuevasImagenes.length > 0) {
      actualizaciones.imagenes = [...auto.imagenes, ...nuevasImagenes];
      
      if (actualizaciones.imagenes.length > CONFIG.IMAGENES.MAX_IMAGENES) {
        await limpiarImagenesTemp(nuevasImagenes);
        return res.status(HTTP_CODES.BAD_REQUEST).json({ 
          success: false,
          message: MENSAJES.ERROR.MAX_IMAGENES
        });
      }
    }

    // Manejo de eliminación de imágenes
    if (req.body.imagenesEliminar) {
      try {
        const idsEliminar = JSON.parse(req.body.imagenesEliminar);
        if (!Array.isArray(idsEliminar)) throw new Error();
        
        actualizaciones.imagenes = (actualizaciones.imagenes || auto.imagenes)
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

    // Actualizar en base de datos
    const autoActualizado = await Auto.findByIdAndUpdate(
      req.params.id,
      actualizaciones,
      { new: true, runValidators: true }
    ).select('-proveedor -__v').lean();

    // Eliminar imágenes en background
    if (imagenesAEliminar.length > 0) {
      setTimeout(async () => {
        try {
          await Promise.all(
            imagenesAEliminar.map(publicId => 
              cloudinary.uploader.destroy(publicId)
            )
          );
        } catch (error) {
          console.error(MENSAJES.ADVERTENCIAS.IMAGENES_ELIMINADAS, error);
        }
      }, 0);
    }

    res.status(HTTP_CODES.OK).json({
      success: true,
      data: autoActualizado,
      message: MENSAJES.EXITO.AUTO_ACTUALIZADO
    });

  } catch (error) {
    await limpiarImagenesTemp(req.uploadedFiles);
    next(error);
  }
});

export const eliminarAuto = asyncHandler(async (req, res, next) => {
  try {
    const auto = await Auto.findById(req.params.id)
      .populate('piezasCompatibles');

    if (!auto) {
      return res.status(HTTP_CODES.NOT_FOUND).json({ 
        success: false,
        message: MENSAJES.ERROR.RECURSO_NO_ENCONTRADO
      });
    }

    // Validar permisos
    if (auto.proveedor.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(HTTP_CODES.FORBIDDEN).json({ 
        success: false,
        message: MENSAJES.ERROR.ACCION_NO_AUTORIZADA
      });
    }

    // Eliminar imágenes de Cloudinary con verificación
    if (auto.imagenes.length > 0) {
      try {
        await Promise.all(
          auto.imagenes.map(async (img) => {
            await cloudinary.uploader.destroy(img.public_id, { invalidate: true });
          })
        );
      } catch (error) {
        console.error(`${MENSAJES.ADVERTENCIAS.IMAGENES_ELIMINADAS}: ${error.message}`);
      }
    }

    // Actualizar PIEZAS relacionadas PRIMERO
    if (auto.piezasCompatibles.length > 0) {
      await Pieza.updateMany(
        { _id: { $in: auto.piezasCompatibles } },
        { $pull: { autosCompatibles: auto._id } },
        { session: req.session }
      );
    }

    // Eliminar el AUTO de MongoDB
    await Auto.deleteOne({ _id: auto._id });

    res.status(HTTP_CODES.OK).json({ 
      success: true,
      message: MENSAJES.EXITO.AUTO_ELIMINADO
    });

  } catch (error) {
    console.error(`Error completo: ${error.stack}`);
    next(error);
  }
});

export const buscarAutos = asyncHandler(async (req, res) => {
  const { 
    q,
    modelo,
    modeloExacto,
    modelos,
    anioMin, 
    anioMax, 
    proveedor, 
    precioMin,
    precioMax,
    piezasCompatibles,
    pagina = 1, 
    limite = 10,
    sort = '-createdAt'
  } = req.query;

  // Validación de parámetros numéricos
  const parseNumber = (val, min, max) => {
    const num = Number(val);
    return isNaN(num) ? null : Math.min(max, Math.max(min, num));
  };

  const page = parseNumber(pagina, 1, 1000) || 1;
  const limit = parseNumber(limite, 1, 100) || 10;

  // Construcción de query
  const query = { deleted: { $ne: true } };
  const options = {
    page,
    limit,
    select: '-__v',
    populate: [
      {
        path: 'proveedor',
        select: 'nombre email -_id',
        match: { deleted: { $ne: true } }
      },
      {
        path: 'piezasCompatibles',
        select: 'nombre stock precio',
        match: { deleted: { $ne: true }, stock: { $gt: 0 } }
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
    if (typeof options.select === 'string') {
      options.select = { [options.select.replace('-', '')]: 0 };
    }
    
    options.select = {
      ...options.select,
      score: { $meta: 'textScore' }
    };
    
    options.sort = { 
      score: { $meta: 'textScore' },
      ...options.sort
    };
  }

  // 2. Filtros de modelo
  if (modeloExacto) {
    query.modelo = { $regex: `^${modeloExacto}$`, $options: 'i' };
  } else if (modelos) {
    query.modelo = { $in: modelos.split(',') };
  } else if (modelo) {
    query.modelo = { $regex: modelo, $options: 'i' };
  }

  // 3. Filtros numéricos
  const addRangeFilter = (field, min, max) => {
    if (min || max) {
      query[field] = {};
      if (min) query[field].$gte = Number(min);
      if (max) query[field].$lte = Number(max);
    }
  };

  addRangeFilter('anio', anioMin, anioMax);
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

  // 5. Filtro por piezas compatibles
  if (piezasCompatibles) {
    const piezasArray = piezasCompatibles.split(',');
    const invalidIds = piezasArray.filter(id => !mongoose.Types.ObjectId.isValid(id));
    
    if (invalidIds.length > 0) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        success: false,
        code: 'INVALID_PART_ID',
        message: MENSAJES.ERROR.PIEZA_INVALIDA,
        invalidIds
      });
    }
    
    query.piezasCompatibles = { $in: piezasArray };
  }

  try {
    const resultados = await Auto.paginate(query, options);

    // Formatear respuesta
    const response = {
      success: true,
      count: resultados.docs.length,
      total: resultados.totalDocs,
      paginas: resultados.totalPages,
      pagina: resultados.page,
      data: resultados.docs.map(doc => {
        if (doc.score) doc.score = parseFloat(doc.score.toFixed(2));
        if (doc.piezasCompatibles) {
          doc.piezasCompatibles = doc.piezasCompatibles.filter(p => p !== null);
        }
        return doc;
      })
    };

    res.status(HTTP_CODES.OK).json(response);
  } catch (error) {
    handleSearchError(res, error, 'AUTO');
  }
});

// Función auxiliar para manejo de errores
const handleSearchError = (res, error, entityType) => {
  console.error(`Error en búsqueda de ${entityType}:`, error);
  
  const errorMap = {
    CastError: {
      code: 'INVALID_SORT_PARAM',
      message: MENSAJES.ERROR.ORDEN_INVALIDO,
      status: HTTP_CODES.BAD_REQUEST
    },
    default: {
      code: `${entityType}_SEARCH_ERROR`,
      message: MENSAJES.ERROR.BUSQUEDA_ERROR,
      status: HTTP_CODES.SERVER_ERROR
    }
  };

  const { code, message, status } = errorMap[error.name] || errorMap.default;
  
  res.status(status).json({
    success: false,
    code,
    message,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};


export const vincularPieza = asyncHandler(async (req, res) => {
  const { autoId, piezaId } = req.params;
  
  // Buscar ambos documentos en paralelo
  const [auto, pieza] = await Promise.all([
    Auto.findById(autoId),
    Pieza.findById(piezaId)
  ]);

  // Validar existencia
  if (!auto || !pieza) {
    return res.status(HTTP_CODES.NOT_FOUND).json({ 
      success: false,
      message: MENSAJES.ERROR.RECURSO_NO_ENCONTRADO
    });
  }

  // Verificar permisos
  if (auto.proveedor.toString() !== req.user.id) {
    return res.status(HTTP_CODES.FORBIDDEN).json({ 
      success: false,
      message: MENSAJES.ERROR.ACCION_NO_AUTORIZADA
    });
  }

  // Validar que la pieza pertenece al mismo proveedor
  if (pieza.proveedor.toString() !== req.user.id) {
    return res.status(HTTP_CODES.FORBIDDEN).json({ 
      success: false,
      message: MENSAJES.ERROR.PIEZAS_IDS_INVALIDOS
    });
  }


  try {
    // Actualizar ambos documentos en paralelo
    const [autoActualizado, piezaActualizada] = await Promise.all([
      Auto.findByIdAndUpdate(
        autoId,
        { $addToSet: { piezasCompatibles: piezaId } },
        { new: true, runValidators: true }
      ).select('-proveedor -__v'),
      
      Pieza.findByIdAndUpdate(
        piezaId,
        { $addToSet: { autosCompatibles: autoId } },
        { new: true }
      ).select('-proveedor -__v')
    ]);

    res.status(HTTP_CODES.OK).json({
      success: true,
      data: {
        auto: autoActualizado,
        pieza: piezaActualizada
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

export const desvincularPieza = asyncHandler(async (req, res) => {
  const { autoId, piezaId } = req.params;

  const [auto, pieza] = await Promise.all([
    Auto.findById(autoId),
    Pieza.findById(piezaId)
  ]);

  if (!auto || !pieza) {
    return res.status(HTTP_CODES.NOT_FOUND).json({ 
      success: false,
      message: MENSAJES.ERROR.RECURSO_NO_ENCONTRADO
    });
  }

  if (auto.proveedor.toString() !== req.user.id) {
    return res.status(HTTP_CODES.FORBIDDEN).json({ 
      success: false,
      message: MENSAJES.ERROR.ACCION_NO_AUTORIZADA
    });
  }

  if (pieza.proveedor.toString() !== req.user.id) {
    return res.status(HTTP_CODES.FORBIDDEN).json({ 
      success: false,
      message: MENSAJES.ERROR.PIEZAS_IDS_INVALIDOS
    });
  }

  try {
    const [autoActualizado, piezaActualizada] = await Promise.all([
      Auto.findByIdAndUpdate(
        autoId,
        { $pull: { piezasCompatibles: piezaId } },
        { new: true, runValidators: true }
      ).select('-proveedor -__v'),
      Pieza.findByIdAndUpdate(
        piezaId,
        { $pull: { autosCompatibles: autoId } },
        { new: true }
      ).select('-proveedor -__v')
    ]);

    res.status(HTTP_CODES.OK).json({
      success: true,
      data: {
        auto: autoActualizado,
        pieza: piezaActualizada
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

export const listarPiezasCompatibles = asyncHandler(async (req, res) => {
  try {
    const auto = await Auto.findById(req.params.id)
      .populate({
        path: 'piezasCompatibles',
        select: 'nombre descripcion stock precio imagenes proveedor',
        match: { deleted: { $ne: true } },
        populate: {
          path: 'proveedor',
          select: 'nombre email'
        }
      });

    if (!auto) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        success: false,
        message: MENSAJES.ERROR.RECURSO_NO_ENCONTRADO
      });
    }

    // Filtrar piezas no eliminadas y mapear datos
    const piezas = auto.piezasCompatibles
      .filter(p => p !== null)
      .map(pieza => ({
        ...pieza._doc,
        imagenes: pieza.imagenes.map(img => ({
          url: img.url,
          id: img.public_id
        }))
      }));

    res.status(HTTP_CODES.OK).json({
      success: true,
      count: piezas.length,
      data: piezas
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

export const listarTodosAutos = asyncHandler(async (req, res) => {
  try {
    const autos = await Auto.find({})
      .populate({
        path: 'proveedor',
        select: 'nombre email -_id',
        match: { deleted: { $ne: true }
      }})
      .select('-__v -piezasCompatibles')
      .lean();

    // Formatear respuesta
    const respuesta = autos.map(auto => ({
      ...auto,
      proveedor: auto.proveedor || { nombre: "Proveedor no disponible" },
      imagenes: auto.imagenes.map(img => ({
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
    console.error(`${MENSAJES.ERROR.SERVER_ERROR}: ${error.message}`);
    res.status(HTTP_CODES.SERVER_ERROR).json({
      success: false,
      message: MENSAJES.ERROR.SERVER_ERROR,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export const getAutoById = asyncHandler(async (req, res) => {
  try {
    const autoId = req.params.id;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(autoId)) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        success: false,
        message: MENSAJES.ERROR.ID_INVALIDO
      });
    }

    // Buscar auto con populate
    const auto = await Auto.findById(autoId)
      .populate('proveedor', 'nombre email')
      .populate('piezasCompatibles', 'nombre precio stock imagenes')
      .lean();

    if (!auto) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        success: false,
        message: MENSAJES.ERROR.RECURSO_NO_ENCONTRADO
      });
    }

    // Formatear imágenes
    auto.imagenes = auto.imagenes.map(img => ({
      url: img.url,
      id: img.public_id
    }));

    // Formatear piezas compatibles
    auto.piezasCompatibles = auto.piezasCompatibles.map(pieza => ({
      ...pieza,
      imagenes: pieza.imagenes.map(img => ({
        url: img.url,
        id: img.public_id
      }))
    }));

    res.status(HTTP_CODES.OK).json({
      success: true,
      data: auto
    });

  } catch (error) {
    console.error(`Error al obtener auto: ${error.message}`);
    res.status(HTTP_CODES.SERVER_ERROR).json({
      success: false,
      message: MENSAJES.ERROR.SERVER_ERROR
    });
  }
});