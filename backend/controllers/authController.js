import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';

// Helper para sanitizar campos
const sanitizeInput = (input) => input.trim();

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Sanitizar
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedPassword = sanitizeInput(password);

  // 1. Buscar usuario
  const user = await User.findOne({ email: sanitizedEmail }).select('+password');
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // 2. Comparar contraseñas
  const isMatch = await bcrypt.compare(sanitizedPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  // ACTUALIZACIÓN: Invalidar tokens anteriores
  user.tokenValidoDesde = Date.now();

  await user.save();

  // 3. Generar token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  res.json({
    _id: user._id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    token
  });
});

export const actualizarPerfil = asyncHandler(async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['nombre', 'email', 'password', 'telefono', 'direccion'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Campos no permitidos' });
  }

  // Hashear solo si hay nueva contraseña
  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, 12);
    // ACTUALIZACIÓN: Invalidar tokens al cambiar contraseña
    req.user.tokenValidoDesde = Date.now();
  }

  Object.assign(req.user, req.body);
  await req.user.save();
  res.json(req.user);
});

// Perfil del usuario logueado
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});