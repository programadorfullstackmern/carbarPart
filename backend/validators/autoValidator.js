import { body, param, query, validationResult } from 'express-validator';
import { MENSAJES, CONFIG } from '../utils/constants.js';
import mongoose from 'mongoose';
import Auto from '../models/Auto.js';

const validarPiezas = (value, { req }) => {
  try {
    let piezas;
    if (typeof value === 'string') {
      try {
        piezas = JSON.parse(value);
      } catch (parseError) {
        piezas = value.split(',').map(id => id.trim());
      }
    } else if (Array.isArray(value)) {
      piezas = value;
    } else {
      piezas = [];
    }
    
    if (!Array.isArray(piezas)) {
      throw new Error(MENSAJES.ERROR.PIEZAS_INVALIDAS);
    }
    
    const invalidIds = piezas.filter(id => 
      !mongoose.Types.ObjectId.isValid(id)
    );
    
    if (invalidIds.length > 0) {
      throw new Error(MENSAJES.ERROR.PIEZAS_IDS_INVALIDOS);
    }
    
    return true;
  } catch (error) {
    throw new Error(MENSAJES.ERROR.PIEZAS_INVALIDAS);
  }
};

export const autoValidaciones = {
  crear: [
    body('modelo')
      .trim()
      .escape()
      .notEmpty().withMessage(MENSAJES.ERROR.MODELO_REQUERIDO)
      .isLength({ 
        min: CONFIG.MODELO_LONGITUD.MODELO_MIN, 
        max: CONFIG.MODELO_LONGITUD.MODELO_MAX 
      }).withMessage(MENSAJES.ERROR.MODELO_LONGITUD),
    
    body('anio')
      .isInt().withMessage(MENSAJES.ERROR.ANIO_FORMATO)
      .toInt()
      .custom(value => {
        if (value < CONFIG.ANIO.MIN || value > CONFIG.ANIO.MAX) {
          throw new Error(MENSAJES.ERROR.ANIO_INVALIDO);
        }
        return true;
      }),
    
    body('precio')
      .optional()
      .isFloat({ 
        min: CONFIG.PRECIO.MIN, 
        max: CONFIG.PRECIO.MAX 
      }).withMessage(MENSAJES.ERROR.PRECIO_INVALIDO)
      .toFloat(),
    
    body('piezasCompatibles')
      .custom(validarPiezas)
  ],

  actualizar: [
    param('id')
      .isMongoId().withMessage(MENSAJES.ERROR.ID_INVALIDO),
    
    body('modelo')
      .optional()
      .trim()
      .escape()
      .isLength({ 
        min: CONFIG.MODELO_LONGITUD.MODELO_MIN, 
        max: CONFIG.MODELO_LONGITUD.MODELO_MAX 
      }).withMessage(MENSAJES.ERROR.MODELO_LONGITUD),
    
    body('anio')
      .optional()
      .isInt().withMessage(MENSAJES.ERROR.ANIO_FORMATO)
      .toInt()
      .custom(value => {
        if (value < CONFIG.ANIO.MIN || value > CONFIG.ANIO.MAX) {
          throw new Error(MENSAJES.ERROR.ANIO_INVALIDO);
        }
        return true;
      }),
    
    body('imagenesEliminar')
      .optional()
      .isString().withMessage(MENSAJES.ERROR.IMAGENES_ELIMINAR_FORMATO)
  ],

  buscar: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 3 }).withMessage(MENSAJES.ERROR.BUSQUEDA_CORTA),
    
    query('modelo').optional().trim(),
    
    query('modeloExacto')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage(MENSAJES.ERROR.MODELO_LONGITUD),
    
    query('modelos')
      .optional()
      .trim()
      .custom(value => {
        const modelos = value.split(',');
        return modelos.every(m => m.length >= 2);
      }).withMessage(MENSAJES.ERROR.MODELO_LONGITUD),
    
    query('anioMin')
      .optional()
      .isInt({ min: CONFIG.ANIO.MIN, max: CONFIG.ANIO.MAX })
      .withMessage(MENSAJES.ERROR.ANIO_INVALIDO)
      .toInt(),
    
    query('anioMax')
      .optional()
      .isInt({ min: CONFIG.ANIO.MIN, max: CONFIG.ANIO.MAX })
      .withMessage(MENSAJES.ERROR.ANIO_INVALIDO)
      .toInt(),
    
    query('proveedor')
      .optional()
      .custom(value => {
        if (!mongoose.isValidObjectId(value)) {
          throw new Error(MENSAJES.ERROR.PROVEEDOR_INVALIDO);
        }
        return true;
      }),
    
    query('precioMin')
      .optional()
      .isFloat({ min: CONFIG.PRECIO.MIN, max: CONFIG.PRECIO.MAX })
      .withMessage(MENSAJES.ERROR.PRECIO_INVALIDO)
      .toFloat(),
    
    query('precioMax')
      .optional()
      .isFloat({ min: CONFIG.PRECIO.MIN, max: CONFIG.PRECIO.MAX })
      .withMessage(MENSAJES.ERROR.PRECIO_INVALIDO)
      .toFloat(),

      query('fields')
      .optional()
      .custom(value => {
        const fields = value.split(',');
        const hasInclusion = fields.some(f => !f.startsWith('-'));
        const hasExclusion = fields.some(f => f.startsWith('-'));
        
        if (hasInclusion && hasExclusion) {
          throw new Error('No se pueden mezclar inclusiones y exclusiones');
        }
        return true;
      })
      .withMessage('Use solo campos a incluir O solo campos a excluir'),
    
    query('piezasCompatibles')
      .optional()
      .custom(value => {
        const piezas = value.split(',');
        const invalidIds = piezas.filter(id => !mongoose.isValidObjectId(id));
        
        if (invalidIds.length > 0) {
          throw new Error(MENSAJES.ERROR.PIEZAS_IDS_INVALIDOS);
        }
        return true;
      }),
    
    query('pagina')
      .optional()
      .isInt({ min: 1 }).withMessage('Número de página inválido')
      .toInt(),
    
    query('limite')
      .optional()
      .isInt({ min: 1, max: CONFIG.PAGINACION_LIMITE.MAX_LIMITE })
      .withMessage(MENSAJES.ERROR.LIMITE_INVALIDO)
      .toInt(),
    
    query('sort')
      .optional()
      .matches(/^-?[a-zA-Z_]+(,-?[a-zA-Z_]+)*$/)
      .withMessage(MENSAJES.ERROR.ORDEN_INVALIDO)
  ],

  manejoErrores: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array().map(err => ({
          campo: err.param,
          mensaje: err.msg
        }))
      });
    }
    next();
  }
};