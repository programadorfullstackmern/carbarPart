import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// Middleware para proteger rutas
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Acceso no autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 1. Buscar usuario y validar existencia
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {  // 👈 Validación crítica
      return res.status(401).json({ message: 'Usuario no existe' });
    }

    // 2. Verificar validez del token
    const tokenValidoDesdeSegundos = Math.floor(user.tokenValidoDesde.getTime() / 1000);
    if (decoded.iat < tokenValidoDesdeSegundos) {
      return res.status(401).json({ message: 'Token inválido (sesión actualizada)' });
    }

    // 3. Asignar usuario a req.user
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Middleware para verificar roles
export const checkRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ 
      message: `Acceso prohibido para rol ${req.user.rol}` 
    });
  }
  next();
};