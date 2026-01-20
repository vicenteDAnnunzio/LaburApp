import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';

// Schema de validación Zod para login
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validar input con Zod
      const validatedData = loginSchema.parse(req.body);

      // Ejecutar login
      const result = await authService.login(validatedData);

      // Devolver respuesta exitosa
      res.status(200).json(result);
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

      // Error de credenciales inválidas → 401
      if (error.message === 'Invalid credentials') {
        res.status(401).json({
          error: 'Invalid credentials',
        });
        return;
      }

      // Otros errores → 500
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /auth/me - Obtener datos del usuario autenticado
   * Endpoint protegido de ejemplo
   */
  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      // El middleware authenticate ya validó el token e inyectó req.user
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Devolver datos del usuario autenticado
      res.status(200).json({
        user: req.user,
      });
    } catch (error: any) {
      console.error('Get me error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}

export const authController = new AuthController();
