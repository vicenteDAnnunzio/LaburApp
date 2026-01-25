import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';

// Schema de validación Zod para login
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Schema de validación Zod para register
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CLIENT', 'PROVIDER'], {
    message: 'Role must be CLIENT or PROVIDER',
  }),
  providerProfile: z.object({
    zona: z.string().min(1, 'Zone is required'),
    servicios: z.array(z.string()).min(1, 'At least one service is required'),
    experiencia: z.number().int().min(0, 'Experience must be a positive number'),
    descripcion: z.string().optional(),
    telefono: z.string().optional(),
  }).optional(),
}).refine(
  (data) => {
    // Si role es PROVIDER, providerProfile debe estar presente
    if (data.role === 'PROVIDER') {
      return data.providerProfile !== undefined;
    }
    return true;
  },
  {
    message: 'Provider profile is required for PROVIDER role',
    path: ['providerProfile'],
  }
);

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

  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validar input con Zod
      const validatedData = registerSchema.parse(req.body);

      // Ejecutar registro
      const result = await authService.register(validatedData);

      // Devolver respuesta exitosa con 201 Created
      res.status(201).json(result);
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

      // Error de email duplicado → 409
      if (error.statusCode === 409 || error.message === 'Email already exists') {
        res.status(409).json({
          error: 'Email already exists',
        });
        return;
      }

      // Error de validación de providerProfile
      if (error.message === 'Provider profile is required for PROVIDER role') {
        res.status(400).json({
          error: error.message,
        });
        return;
      }

      // Otros errores → 500
      console.error('Register error:', error);
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
