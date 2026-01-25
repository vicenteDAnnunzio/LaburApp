import { Response } from 'express';
import { z } from 'zod';
import { requestsService } from '../services/requests.service';
import { AuthRequest } from '../types';

// Schema de validación Zod para crear request
const createRequestSchema = z.object({
  providerId: z.string().uuid('Invalid provider ID'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  budget: z.number().positive('Budget must be positive').optional(),
  scheduledAt: z.string().datetime().optional(),
});

// Schema de validación para actualizar request
const updateRequestSchema = z.object({
  action: z.enum(['accept', 'reject', 'cancel'], {
    message: 'Action must be accept, reject, or cancel',
  }),
});

export class RequestsController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Verificar autenticación
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Verificar que sea CLIENT
      if (req.user.role !== 'CLIENT') {
        res.status(403).json({ error: 'Only clients can create requests' });
        return;
      }

      // Validar input con Zod
      const validatedData = createRequestSchema.parse(req.body);

      // Crear request
      const request = await requestsService.create(req.user.id, validatedData);

      // Devolver respuesta exitosa
      res.status(201).json(request);
    } catch (error: any) {
      // Manejo de errores de validación Zod
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      // Error de provider no encontrado → 404
      if (error.statusCode === 404 || error.message === 'Provider not found') {
        res.status(404).json({
          error: 'Provider not found',
        });
        return;
      }

      // Otros errores → 500
      console.error('Create request error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Verificar autenticación
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { as } = req.query;

      // Validar parámetro 'as'
      if (as !== 'client' && as !== 'provider') {
        res.status(400).json({
          error: 'Query parameter "as" must be "client" or "provider"',
        });
        return;
      }

      // Verificar que el usuario tenga el rol correspondiente
      if (as === 'client' && req.user.role !== 'CLIENT') {
        res.status(403).json({
          error: 'Only clients can view requests as client',
        });
        return;
      }

      if (as === 'provider' && req.user.role !== 'PROVIDER') {
        res.status(403).json({
          error: 'Only providers can view requests as provider',
        });
        return;
      }

      // Obtener requests según el rol
      let requests;
      if (as === 'client') {
        requests = await requestsService.listAsClient(req.user.id);
      } else {
        requests = await requestsService.listAsProvider(req.user.id);
      }

      // Devolver respuesta exitosa
      res.status(200).json(requests);
    } catch (error: any) {
      console.error('List requests error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async updateAction(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Verificar autenticación
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;

      // Validar UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({ error: 'Invalid request ID' });
        return;
      }

      // Validar input con Zod
      const validatedData = updateRequestSchema.parse(req.body);

      // Actualizar request
      const updatedRequest = await requestsService.updateAction(
        id,
        req.user.id,
        req.user.role,
        validatedData
      );

      // Devolver respuesta exitosa
      res.status(200).json(updatedRequest);
    } catch (error: any) {
      // Manejo de errores de validación Zod
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      // Error de request no encontrado → 404
      if (error.statusCode === 404 || error.message === 'Request not found') {
        res.status(404).json({
          error: 'Request not found',
        });
        return;
      }

      // Error de permisos → 403
      if (error.statusCode === 403) {
        res.status(403).json({
          error: error.message,
        });
        return;
      }

      // Otros errores → 500
      console.error('Update request error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}

export const requestsController = new RequestsController();
