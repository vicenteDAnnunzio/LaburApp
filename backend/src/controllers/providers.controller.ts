import { Request, Response } from 'express';
import { z } from 'zod';
import { providersService } from '../services/providers.service';
import { AuthRequest } from '../types';

// Schema de validación Zod para actualizar perfil
const updateProfileSchema = z.object({
  zona: z.string().min(1, 'Zone cannot be empty').optional(),
  servicios: z.array(z.string()).min(1, 'At least one service is required').optional(),
  experiencia: z.number().int().min(0, 'Experience must be a positive number').optional(),
  descripcion: z.string().optional(),
  telefono: z.string().optional(),
}).refine(
  (data) => {
    // Al menos un campo debe estar presente
    return Object.keys(data).length > 0;
  },
  {
    message: 'At least one field must be provided',
  }
);

export class ProvidersController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { zona, servicio } = req.query;

      // Validar tipos de query params
      const query = {
        zona: typeof zona === 'string' ? zona : undefined,
        servicio: typeof servicio === 'string' ? servicio : undefined,
      };

      // Obtener lista de proveedores
      const providers = await providersService.listProviders(query);

      // Devolver respuesta exitosa
      res.status(200).json(providers);
    } catch (error: any) {
      console.error('List providers error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async updateMyProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Validar input con Zod
      const validatedData = updateProfileSchema.parse(req.body);

      // Actualizar perfil del usuario autenticado
      const updatedProfile = await providersService.updateMyProfile(
        req.user.id,
        validatedData
      );

      // Devolver respuesta exitosa
      res.status(200).json(updatedProfile);
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

      // Error de perfil no encontrado → 404
      if (error.statusCode === 404 || error.message === 'Provider profile not found') {
        res.status(404).json({
          error: 'Provider profile not found',
        });
        return;
      }

      // Otros errores → 500
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}

export const providersController = new ProvidersController();
