import { Router } from 'express';
import { requestsController } from '../controllers/requests.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /requests
 * Crear una nueva solicitud de servicio
 * Requiere autenticación y rol CLIENT
 */
router.post('/', authenticate, (req, res) => requestsController.create(req, res));

/**
 * GET /requests?as=client|provider
 * Listar solicitudes según el rol
 * Requiere autenticación
 */
router.get('/', authenticate, (req, res) => requestsController.list(req, res));

/**
 * PATCH /requests/:id
 * Actualizar estado de una solicitud (accept/reject/cancel)
 * Requiere autenticación
 */
router.patch('/:id', authenticate, (req, res) => requestsController.updateAction(req, res));

export default router;
