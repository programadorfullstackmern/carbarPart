import { Router } from 'express';
import { 
  actualizarCarrito, 
  obtenerCarrito, 
  vaciarCarrito,
  agregarItemCarrito,
  eliminarItemCarrito, 
  obtenerTodosLosCarritos,
  verificarStockCarrito
} from '../controllers/carritoController.js';
import { protect, checkRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/items', protect, checkRole('cliente'), agregarItemCarrito);

router.route('/')
  .put(protect, checkRole('cliente'), actualizarCarrito)
  .get(protect, checkRole('cliente'), obtenerCarrito)
  .delete(protect, checkRole('cliente'), vaciarCarrito);

router.delete('/items', protect, checkRole('cliente'), eliminarItemCarrito);
router.post('/verificar-stock', protect, checkRole('cliente'), verificarStockCarrito);

router.get('/admin/carritos', protect, checkRole('admin'), obtenerTodosLosCarritos);

export default router;