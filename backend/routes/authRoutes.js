import { Router } from 'express';
import { login, getMe, actualizarPerfil } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';


const router = Router();

// Autenticación pública
router.post('/login', login);   // POST /api/auth/login -> Login (JWT token para todos los roles) -- Permisos: Publico

// Perfil protegido
router.get('/perfil', protect, getMe);    // GET /api/auth/perfil -> Ver perfil propio segun Token -- Permisos: Cualquier usuario autenticado

router.put('/perfil', protect, actualizarPerfil);

export default router;