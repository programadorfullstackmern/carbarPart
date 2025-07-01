import { check } from 'express-validator';
import User from '../models/User.js';

export const usuarioValidaciones = [
  check('nombre')
    .trim()
    .notEmpty().withMessage('Nombre es requerido')
    .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
  
  check('email')
    .isEmail().withMessage('Email inválido')
    .custom(async (email) => {
      const usuario = await User.findOne({ email });
      if (usuario) throw new Error('Email ya registrado');
    }),
  
  check('password')
    .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Debe contener mayúsculas, minúsculas y números'),
  
  check('rol')
    .isIn(['proveedor', 'cliente']).withMessage('Rol inválido'),

  // Nuevas validaciones para teléfono y dirección
  check('telefono')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9\s+\-()]{7,20}$/).withMessage('Formato de teléfono inválido'),

  check('direccion')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Máximo 200 caracteres'),

  check('activo')
    .optional()
    .isBoolean().withMessage('Activo debe ser booleano')
];