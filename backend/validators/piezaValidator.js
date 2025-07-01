import { body,param, query, validationResult } from 'express-validator';
import { MENSAJES, CONFIG, HTTP_CODES } from '../utils/constants.js';
import mongoose from 'mongoose';

const validarAutosCompatibles = (value, { req }) => {
  try {
    let autos;
    if (typeof value === 'string') {
      try {
        autos = JSON.parse(value);
      } catch {
        autos = value.split(',').map(id => id.trim());
      }
    } else if (Array.isArray(value)) {
      autos = value;
    } else {
      autos = [];
    }
    
    if (!Array.isArray(autos)) throw new Error(MENSAJES.ERROR.AUTOS_INVALIDOS);
    
    const invalidIds = autos.filter(id => 
      !mongoose.Types.ObjectId.isValid(id)
    );
    
    if (invalidIds.length > 0) throw new Error(MENSAJES.ERROR.AUTOS_IDS_INVALIDOS);
    
    return true;
  } catch (error) {
    throw new Error(MENSAJES.ERROR.AUTOS_INVALIDOS);
  }
};

export const piezaValidaciones = {
  crear: [
    body('nombre')
      .trim()
      .escape()
      .notEmpty().withMessage(MENSAJES.ERROR.NOMBRE_REQUERIDO)
      .isLength({ max: 100 }).withMessage(MENSAJES.ERROR.NOMBRE_LONGITUD),
    
    body('stock')
      .isInt({ min: 0 }).withMessage(MENSAJES.ERROR.STOCK_INVALIDO)
      .toInt(),
    
    body('autosCompatibles').optional().custom(validarAutosCompatibles)
  ],

  actualizar: [
    param('id')
      .isMongoId().withMessage(MENSAJES.ERROR.ID_INVALIDO),
    
    body('nombre')
      .optional()
      .trim()
      .escape()
      .isLength({ max: 100 }).withMessage(MENSAJES.ERROR.NOMBRE_LONGITUD),
    
    body('stock')
      .optional()
      .isInt({ min: 0 }).withMessage(MENSAJES.ERROR.STOCK_INVALIDO)
      .toInt(),
    
    body('autosCompatibles')
      .optional()
      .custom(validarAutosCompatibles)
  ],

  buscar: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 3 }).withMessage(MENSAJES.ERROR.BUSQUEDA_CORTA),
    
    query('nombre').optional().trim(),
    
    query('nombreExacto')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage(MENSAJES.ERROR.NOMBRE_LONGITUD),
    
    query('nombres')
      .optional()
      .trim()
      .custom(value => {
        const nombres = value.split(',');
        return nombres.every(n => n.length >= 2);
      }).withMessage(MENSAJES.ERROR.NOMBRE_LONGITUD),
    
    query('stockMin')
      .optional()
      .isInt({ min: 0, max: CONFIG.PAGINACION.MAX_STOCK })
      .withMessage(MENSAJES.ERROR.STOCK_INVALIDO)
      .toInt(),
    
    query('stockMax')
      .optional()
      .isInt({ min: 0, max: CONFIG.PAGINACION.MAX_STOCK })
      .withMessage(MENSAJES.ERROR.STOCK_INVALIDO)
      .toInt(),
    
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
    
    query('proveedor')
      .optional()
      .custom(value => {
        if (!mongoose.isValidObjectId(value)) {
          throw new Error(MENSAJES.ERROR.PROVEEDOR_INVALIDO);
        }
        return true;
      }),

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

    query('autosCompatibles')
      .optional()
      .custom(value => {
        const autos = value.split(',');
        const invalidIds = autos.filter(id => !mongoose.isValidObjectId(id));
        
        if (invalidIds.length > 0) {
          throw new Error(MENSAJES.ERROR.AUTOS_IDS_INVALIDOS);
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