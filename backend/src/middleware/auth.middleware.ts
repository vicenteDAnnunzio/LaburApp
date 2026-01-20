import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extraer token del header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Verificar JWT
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      role: Role;
    };

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Inyectar usuario en req.user
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    // Token inválido, expirado o mal formado
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
}

/**
 * Middleware to check if user has required role
 * TODO PHASE 2: Use with authenticate middleware
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
