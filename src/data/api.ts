/**
 * Capa de acceso a datos unificada.
 * Punto único de acceso para toda la UI.
 * Selecciona automáticamente el adaptador según la configuración.
 */

import { config } from '../config';
import { mockAdapter } from './adapters/mockAdapter';
import { httpAdapter } from './adapters/httpAdapter';
import type { DataAdapter } from './types';

// Seleccionar adaptador según configuración
const adapter: DataAdapter = config.dataAdapter === 'http' ? httpAdapter : mockAdapter;

// Re-exportar tipos para conveniencia
export type {
  RegisterData,
  LoginData,
  AuthResponse,
  User,
  UserWithProfile,
  ProviderProfile,
  ListProvidersParams,
  CreateRequestData,
  UpdateRequestData,
  RequestFilter,
} from './types';

// ==================== AUTH API ====================

/**
 * Registra un nuevo usuario
 */
export const register = adapter.register.bind(adapter);

/**
 * Inicia sesión
 */
export const login = adapter.login.bind(adapter);

/**
 * Cierra sesión
 */
export const logout = adapter.logout.bind(adapter);

/**
 * Obtiene información del usuario actual
 */
export const getMe = adapter.getMe.bind(adapter);

/**
 * Actualiza información del usuario actual
 */
export const updateMe = adapter.updateMe.bind(adapter);

/**
 * Actualiza el perfil de proveedor del usuario actual
 */
export const updateProviderProfile = adapter.updateProviderProfile.bind(adapter);

// ==================== PROVIDERS API ====================

/**
 * Lista proveedores con filtros opcionales
 */
export const listProviders = adapter.listProviders.bind(adapter);

// ==================== REQUESTS API ====================

/**
 * Crea una nueva solicitud de servicio
 */
export const createRequest = adapter.createRequest.bind(adapter);

/**
 * Lista solicitudes según el filtro
 * - 'client': solicitudes del cliente actual
 * - 'provider': solicitudes del proveedor actual
 * - 'all': todas las solicitudes (admin)
 */
export const listRequests = adapter.listRequests.bind(adapter);

/**
 * Actualiza una solicitud de servicio
 */
export const updateRequest = adapter.updateRequest.bind(adapter);

// ==================== HELPERS ====================

/**
 * Verifica si se está usando el adaptador HTTP
 */
export function isUsingHttpAdapter(): boolean {
  return config.dataAdapter === 'http';
}

/**
 * Verifica si se está usando el adaptador mock
 */
export function isUsingMockAdapter(): boolean {
  return config.dataAdapter === 'mock';
}

/**
 * Obtiene el nombre del adaptador actual
 */
export function getCurrentAdapter(): string {
  return config.dataAdapter;
}
