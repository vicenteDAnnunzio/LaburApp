import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /auth/login
 * Autenticar usuario y generar JWT
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * GET /auth/me
 * Obtener datos del usuario autenticado (ruta protegida)
 */
router.get('/me', authenticate, (req, res) => authController.getMe(req, res));

export default router;
