import { Router } from 'express';
import { 
  crearPieza, 
  actualizarPieza, 
  eliminarPieza, 
  buscarPiezas, 
  vincularAuto, 
  desvincularAuto,
  listarAutosCompatibles,
  listarTodasPiezas,
  getPiezaById
} from '../controllers/piezaController.js';
import { protect, checkRole } from '../middlewares/authMiddleware.js';
import { upload, uploadToCloudinary } from '../middlewares/uploadMiddleware.js';
import { piezaValidaciones } from '../validators/piezaValidator.js';
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
    piezaValidaciones.buscar,
    piezaValidaciones.manejoErrores,
    buscarPiezas
  )
  .post(
    protect,
    checkRole('proveedor'),
    upload.array('imagenes', CONFIG.IMAGENES.MAX_IMAGENES),
    handleMulterErrors,
    uploadToCloudinary('piezas'),
    piezaValidaciones.crear,
    piezaValidaciones.manejoErrores,
    crearPieza
  );

router.route('/:id')
  .put(
    protect,
    checkRole('proveedor', 'admin'),
    upload.array('imagenes', CONFIG.IMAGENES.MAX_IMAGENES),
    handleMulterErrors,
    uploadToCloudinary('piezas'),
    piezaValidaciones.actualizar,
    piezaValidaciones.manejoErrores,
    actualizarPieza
  )
  .delete(
    protect,
    checkRole('proveedor', 'admin'),
    eliminarPieza
  );

router.post('/:piezaId/vincular-auto/:autoId',
  protect,
  checkRole('proveedor'),
  vincularAuto
);

router.delete('/:piezaId/desvincular-auto/:autoId',
  protect,
  checkRole('proveedor'),
  desvincularAuto
);

router.get('/:id/autos',
  protect,
  checkRole('proveedor'),
  listarAutosCompatibles
);

router.get('/todas',
  protect,
  checkRole('admin'),
  listarTodasPiezas
);

// Nueva ruta para obtener una pieza por ID
router.get('/:id/detalle',
  protect,
  getPiezaById
);

export default router;