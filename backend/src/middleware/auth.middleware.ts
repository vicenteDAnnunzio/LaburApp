import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

/**
 * Middleware to verify JWT token and attach user to request
 * TODO PHASE 2: Implement actual JWT verification
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // TODO PHASE 2: Implement JWT verification
    // const decoded = jwt.verify(token, config.jwtSecret) as any;
    // const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    // if (!user || !user.isActive) {
    //   res.status(401).json({ error: 'Invalid or expired token' });
    //   return;
    // }

    // req.user = {
    //   id: user.id,
    //   email: user.email,
    //   role: user.role,
    // };

    // Placeholder for PHASE 1
    res.status(501).json({ error: 'Authentication not implemented yet (PHASE 2)' });
    return;
  } catch (error) {
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
