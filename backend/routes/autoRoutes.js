import { Router } from 'express';
import { 
  crearAuto, 
  actualizarAuto, 
  eliminarAuto, 
  buscarAutos,
  vincularPieza, 
  desvincularPieza,
  listarPiezasCompatibles,
  listarTodosAutos,
  getAutoById
} from '../controllers/autoController.js';
import { protect, checkRole } from '../middlewares/authMiddleware.js';
import { upload, uploadToCloudinary } from '../middlewares/uploadMiddleware.js';
import { autoValidaciones } from '../validators/autoValidator.js';
import { MENSAJES, CONFIG, HTTP_CODES } from '../utils/constants.js';
import multer from 'multer';

const router = Router();

const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' 
      ? MENSAJES.ERROR.TAMAÑO_IMAGEN
      : MENSAJES.ERROR.MAX_IMAGENES;
    return res.status(HTTP_CODES.REQUEST_TOO_LONG).json({ 
      success: false,
      message 
    });
  }
  next(err);
};

router.route('/')
  .get(
    protect,
    autoValidaciones.buscar,
    autoValidaciones.manejoErrores,
    buscarAutos
  )
  .post(
    protect,
    checkRole('proveedor'),
    upload.array('imagenes', CONFIG.IMAGENES.MAX_IMAGENES),
    handleMulterErrors,
    uploadToCloudinary('autos'),
    autoValidaciones.crear,
    autoValidaciones.manejoErrores, 
    crearAuto
  );

router.route('/:id')
  .put(
    protect,
    checkRole('proveedor', 'admin'),
    upload.array('imagenes', CONFIG.IMAGENES.MAX_IMAGENES),
    handleMulterErrors,
    uploadToCloudinary('autos'),
    autoValidaciones.actualizar,
    autoValidaciones.manejoErrores,
    actualizarAuto
  )
  .delete(
    protect,
    checkRole('proveedor', 'admin'),
    eliminarAuto
  );

router.post('/:autoId/vincular-pieza/:piezaId',
  protect,
  checkRole('proveedor'),
  vincularPieza
);

router.delete('/:autoId/desvincular-pieza/:piezaId',
  protect,
  checkRole('proveedor'),
  desvincularPieza
);

router.get('/:id/piezas',
  protect,
  checkRole('proveedor'),
  listarPiezasCompatibles
);

router.get('/todos',
  protect,
  checkRole('admin'),
  listarTodosAutos
);

// Nueva ruta para obtener un auto por ID
router.get('/:id/detalle',
  protect,
  getAutoById
);

export default router;