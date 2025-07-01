import { Router } from 'express';
import { registrarUsuario, eliminarUsuario, editarUsuario, listarUsuarios, obtenerUsuario, listarClientes, listarProveedores } from '../controllers/adminController.js';
import { protect, checkRole } from '../middlewares/authMiddleware.js';
import { usuarioValidaciones } from '../validators/userValidator.js';

const router = Router();

router.post('/registro', protect, checkRole('admin'), usuarioValidaciones, registrarUsuario); // POST /api/admin/registro -> Registro (rol proveedor o rol cliente) -- Permisos: admin

router.get('/usuarios', protect, checkRole('admin'), listarUsuarios); // GET /api/admin/usuarios -> Listar todos los usuarios (sin passwords) -- Permisos: admin

// Nueva ruta para clientes
router.get('/usuarios/clientes', protect, checkRole('admin'), listarClientes);

// Nueva ruta para proveedores
router.get('/usuarios/proveedores', protect, checkRole('admin'), listarProveedores);

router.put('/usuarios/:id', protect, checkRole('admin'), editarUsuario); // PUT /api/admin/usuarios/:id -> Editar cualquier usuario -- Permisos: admin

// Eliminar usuario (solo admin)
router.delete('/usuarios/:id', protect, checkRole('admin'), eliminarUsuario); // DELETE /api/admin/usuarios/:id -> Eliminar usuario (excepto admins) -- Permisos: admin

router.get('/usuarios/:id', protect, checkRole('admin'), obtenerUsuario); // GET /api/admin/usuarios/:id -> Ver perfil de cualquier usuario -- Permisos: admin


export default router;