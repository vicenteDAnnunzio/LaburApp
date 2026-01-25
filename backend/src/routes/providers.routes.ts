import { Router } from 'express';
import { providersController } from '../controllers/providers.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /providers
 * Listar proveedores con filtros opcionales (zona, servicio)
 * Endpoint público - no requiere autenticación
 */
router.get('/', (req, res) => providersController.list(req, res));

/**
 * PUT /providers/me
 * Actualizar perfil del proveedor autenticado
 * Requiere autenticación y rol PROVIDER
 */
router.put('/me', authenticate, requireRole('PROVIDER'), (req, res) => 
  providersController.updateMyProfile(req, res)
);

export default router;
