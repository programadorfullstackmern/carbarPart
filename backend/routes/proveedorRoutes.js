  // routes/proveedorRoutes.js
  import { Router } from 'express';
  import { 
    obtenerAutosProveedor,
    obtenerMisAutos, 
    obtenerMisPiezas, 
    obtenerPiezasProveedor,
    obtenerMisOrdenes
  } from '../controllers/proveedorController.js';
  import { protect, checkRole } from '../middlewares/authMiddleware.js';

  const router = Router();

  // Rutas para ADMIN
router.get('/:proveedorId/autos', 
  protect,
  checkRole('admin'),
  obtenerAutosProveedor  // Usar nuevo controlador
);

router.get('/:proveedorId/piezas', 
  protect,
  checkRole('admin'),
  obtenerPiezasProveedor  // Usar nuevo controlador
);

  router.get('/autos',
    protect,
    checkRole('proveedor'),
    obtenerMisAutos
  );

  router.get('/piezas',
    protect,
    checkRole('proveedor'),
    obtenerMisPiezas
  );

  router.get('/ordenes',
    protect,
    checkRole('proveedor'),
    obtenerMisOrdenes
  );

  export default router;