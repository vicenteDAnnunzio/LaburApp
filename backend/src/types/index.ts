import { Role } from '@prisma/client';
import { Request } from 'express';

/**
 * Type definitions for the ServiceFinder API
 */

// Auth Request con usuario autenticado
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

// Auth
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
  token: string;
}

// User
export interface UpdateUserDto {
  name?: string;
  phone?: string;
}

// Provider Profile
export interface CreateProviderProfileDto {
  businessName: string;
  serviceType: string;
  description?: string;
  location: string;
  availability?: string;
}

export interface UpdateProviderProfileDto {
  businessName?: string;
  serviceType?: string;
  description?: string;
  location?: string;
  availability?: string;
}

export interface SearchProvidersQuery {
  serviceType?: string;
  location?: string;
  minRating?: number;
}

// Service Request
export interface CreateServiceRequestDto {
  title: string;
  description: string;
  location: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  budget?: number;
  scheduledAt?: Date | string;
}

export interface UpdateServiceRequestDto {
  title?: string;
  description?: string;
  location?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH';
  budget?: number;
  scheduledAt?: Date | string;
}

export interface UpdateRequestStatusDto {
  status: 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}
