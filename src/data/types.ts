/**
 * Tipos y contratos de la capa de acceso a datos.
 * Define las interfaces para todos los adaptadores (mock y http).
 */

import type { Provider } from '../types';
import type { ServiceRequest } from '../types/request';

// ==================== AUTH ====================

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'provider';
  providerProfile?: {
    zona: string;
    servicios: string[];
    experiencia: number;
    descripcion?: string;
    telefono?: string;
    disponibilidad?: string;
    perfilActivo?: boolean;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'provider';
  avatar?: string;
}

export interface ProviderProfile {
  userId: string;
  zona: string;
  servicios: string[];
  experiencia: number;
  descripcion?: string;
  telefono?: string;
  disponible: boolean;
  disponibilidad?: string;
  perfilActivo?: boolean;
}

export interface UserWithProfile extends User {
  providerProfile?: ProviderProfile;
}

// ==================== PROVIDERS ====================

export interface ListProvidersParams {
  zona?: string;
  servicio?: string;
}

// ==================== REQUESTS ====================

export interface CreateRequestData {
  providerId: string;
  providerName: string;
  providerService: string;
  providerZona: string;
  zona: string;
  urgencia: ServiceRequest['urgencia'];
  descripcion?: string;
  direccion: string;
  referencias?: string;
  metodoPago: ServiceRequest['metodoPago'];
}

export interface UpdateRequestData {
  action: 'accept' | 'reject' | 'cancel';
}

export type RequestFilter = 'all' | 'client' | 'provider';

// ==================== DATA ADAPTER INTERFACE ====================

/**
 * Interfaz que deben implementar todos los adaptadores de datos
 */
export interface DataAdapter {
  // Auth
  register(data: RegisterData): Promise<AuthResponse>;
  login(data: LoginData): Promise<AuthResponse>;
  logout(): Promise<void>;
  getMe(): Promise<UserWithProfile>;
  updateMe(data: Partial<User>): Promise<User>;
  updateProviderProfile(data: Partial<ProviderProfile>): Promise<ProviderProfile>;

  // Providers
  listProviders(params?: ListProvidersParams): Promise<Provider[]>;

  // Requests
  createRequest(data: CreateRequestData): Promise<ServiceRequest>;
  listRequests(filter: RequestFilter): Promise<ServiceRequest[]>;
  updateRequest(id: string, data: UpdateRequestData): Promise<ServiceRequest>;
}
