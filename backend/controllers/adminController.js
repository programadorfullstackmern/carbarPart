import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Auto, Pieza, User } from '../models/index.js';
import asyncHandler from 'express-async-handler';

// Helper para sanitizar campos
const sanitizeInput = (input) => input.trim();

// Registro unificado (actualizado con nuevos campos)
export const registrarUsuario = asyncHandler(async (req, res) => {
  if (req.body.rol === 'admin') {
    return res.status(403).json({ message: 'Registro de admin no permitido' });
  }

  // Validación de contraseña
  const password = sanitizeInput(req.body.password);
  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Crear usuario con nuevos campos
  const user = await User.create({
    ...req.body,
    email: sanitizeInput(req.body.email),
    telefono: req.body.telefono ? sanitizeInput(req.body.telefono) : undefined,
    direccion: req.body.direccion ? sanitizeInput(req.body.direccion) : undefined,
    activo: req.body.activo !== undefined ? req.body.activo : true, // Nuevo campo
    password: bcrypt.hashSync(password, 12),
  });
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({ ...user.toJSON(), token });
});

export const editarUsuario = asyncHandler(async (req, res) => {
  const usuario = await User.findById(req.params.id);
  
  if (!usuario) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  // Campos permitidos actualizados (incluye nuevos campos)
  const allowedUpdates = ['nombre', 'email', 'password', 'telefono', 'direccion', 'activo'];
  const receivedUpdates = Object.keys(req.body);

  // Verificar campos no permitidos
  const invalidUpdates = receivedUpdates.filter(
    field => !allowedUpdates.includes(field)
  );

  if (invalidUpdates.length > 0) {
    res.status(400);
    throw new Error(`Campos no permitidos para actualización: ${invalidUpdates.join(', ')}`);
  }

  // Actualizar campos permitidos
  if (req.body.nombre) usuario.nombre = sanitizeInput(req.body.nombre);
  if (req.body.email) usuario.email = sanitizeInput(req.body.email);
  if (req.body.telefono !== undefined) {
    usuario.telefono = req.body.telefono ? sanitizeInput(req.body.telefono) : null;
  }
  if (req.body.direccion !== undefined) {
    usuario.direccion = req.body.direccion ? sanitizeInput(req.body.direccion) : null;
  }
  if (req.body.activo !== undefined) {
    usuario.activo = req.body.activo;
  }
  
  // Manejo especial para la contraseña
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(req.body.password, salt);
  }

  // Guardar cambios y excluir contraseña en la respuesta
  const updatedUser = await usuario.save();
  const userResponse = updatedUser.toObject();
  delete userResponse.password;

  res.json(userResponse);
});

// Eliminar usuario + recursos asociados (solo admin)
export const eliminarUsuario = asyncHandler(async (req, res) => {
  const usuario = await User.findById(req.params.id);
  
  if (usuario.rol === 'proveedor') {
    await Promise.all([
      Auto.deleteMany({ proveedor: usuario._id }),
      Pieza.deleteMany({ proveedor: usuario._id })
    ]);
  }

  await usuario.deleteOne();
  res.json({ message: 'Usuario eliminado' });
});

// Resto de métodos (sin cambios pero incluir para completitud)
export const listarUsuarios = asyncHandler(async (req, res) => {
  const usuarios = await User.find({}, '-password');
  res.json(usuarios);
});

export const obtenerUsuario = asyncHandler(async (req, res) => {
  const usuario = await User.findById(req.params.id).select('-password');
  if (!usuario) throw new Error('Usuario no encontrado');
  res.json(usuario);
});

export const listarClientes = asyncHandler(async (req, res) => {
  const clientes = await User.find({ rol: 'cliente' }, '-password');
  res.json(clientes);
});

export const listarProveedores = asyncHandler(async (req, res) => {
  const proveedores = await User.find({ rol: 'proveedor' }, '-password');
  res.json(proveedores);
});