// ordenRoutes.js
import { Router } from 'express';
import { 
  crearOrden, 
  obtenerHistorial,
  obtenerTodasOrdenes,
  obtenerOrdenPorId,
  actualizarEstadoOrden,
  obtenerOrdenesProveedor,
  actualizarEstadoOrdenProveedor
} from '../controllers/ordenController.js';
import { protect, checkRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Rutas para clientes
router.route('/')
  .post(protect, checkRole('cliente'), crearOrden)
  .get(protect, checkRole('cliente'), obtenerHistorial);

// Rutas para administradores
router.get('/admin', protect, checkRole('admin'), obtenerTodasOrdenes);
router.patch('/admin/:id/estado', protect, checkRole('admin'), actualizarEstadoOrden);

// Rutas para proveedores
router.get('/proveedor', protect, checkRole('proveedor'), obtenerOrdenesProveedor);
router.patch('/proveedor/:id/estado', protect, checkRole('proveedor'), actualizarEstadoOrdenProveedor);

// Ruta compartida para obtener orden por ID
router.get('/:id', protect, checkRole('cliente', 'admin', 'proveedor'), obtenerOrdenPorId);

export default router;