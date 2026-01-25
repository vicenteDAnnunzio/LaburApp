import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { config } from '../config/env';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: 'CLIENT' | 'PROVIDER';
  providerProfile?: {
    zona: string;
    servicios: string[];
    experiencia: number;
    descripcion?: string;
    telefono?: string;
  };
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class AuthService {
  async login(input: LoginInput): Promise<LoginResponse> {
    const { email, password } = input;

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
      },
    });

    // Si no existe el usuario → 401
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Comparar password con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generar JWT con userId y role
    const payload = {
      userId: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    // Devolver token y datos del usuario (sin password)
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(input: RegisterInput): Promise<LoginResponse> {
    const { name, email, password, role, providerProfile } = input;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error('Email already exists');
      (error as any).statusCode = 409;
      throw error;
    }

    // Validar que si role=PROVIDER, providerProfile sea obligatorio
    if (role === 'PROVIDER' && !providerProfile) {
      throw new Error('Provider profile is required for PROVIDER role');
    }

    // Hashear password con bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario y perfil de proveedor en una transacción
    const user = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        },
      });

      // Si es PROVIDER, crear ProviderProfile
      if (role === 'PROVIDER' && providerProfile) {
        await tx.providerProfile.create({
          data: {
            userId: newUser.id,
            zona: providerProfile.zona,
            servicios: providerProfile.servicios,
            experiencia: providerProfile.experiencia,
            descripcion: providerProfile.descripcion,
            telefono: providerProfile.telefono,
          },
        });
      }

      return newUser;
    });

    // Generar JWT con userId y role
    const payload = {
      userId: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    // Devolver token y datos del usuario
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export const authService = new AuthService();
