/**
 * Adaptador HTTP para comunicación con backend real.
 * Estructura preparada pero requiere backend activo para funcionar.
 */

import type {
  DataAdapter,
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
} from '../types';
import type { Provider } from '../../types';
import type { ServiceRequest } from '../../types/request';
import { get, post, put, patch } from '../../lib/httpClient';
import { setSession, setAuthToken, clearSession, setUserData } from '../../lib/session';

/**
 * Adaptador HTTP para backend real
 * Endpoints esperados:
 * 
 * POST   /api/auth/register
 * POST   /api/auth/login
 * Logout: solo local (sin endpoint)
 * GET    /api/auth/me
 * 
 * PUT    /api/auth/me
 * 
 * GET    /api/providers?zona=X&servicio=Y
 * 
 * POST   /api/requests
 * GET    /api/requests?as=client
 * GET    /api/requests?as=provider
 * PATCH  /api/requests/:id  { action: "accept" | "reject" | "cancel" }
 */
export const httpAdapter: DataAdapter = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await post<{ token: string; user: any }>('/api/auth/register', data, { auth: false });
      
      // El backend retorna { token, user }, necesitamos adaptarlo a AuthResponse
      if (response.token && response.user) {
        // Normalizar role de mayúsculas a minúsculas
        const normalizedUser: User = {
          ...response.user,
          role: response.user.role.toLowerCase() as 'client' | 'provider'
        };
        
        setAuthToken(response.token);
        setSession(normalizedUser.email);
        setUserData(normalizedUser);
        
        return {
          success: true,
          token: response.token,
          user: normalizedUser
        };
      }
      
      return {
        success: false,
        message: 'Respuesta inválida del servidor'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.data?.error || error.message || 'Error en el registro'
      };
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await post<{ token: string; user: any }>('/api/auth/login', data, { auth: false });
      
      // El backend retorna { token, user }, necesitamos adaptarlo a AuthResponse
      if (response.token && response.user) {
        // Normalizar role de mayúsculas a minúsculas
        const normalizedUser: User = {
          ...response.user,
          role: response.user.role.toLowerCase() as 'client' | 'provider'
        };
        
        setAuthToken(response.token);
        setSession(normalizedUser.email);
        setUserData(normalizedUser);
        
        return {
          success: true,
          token: response.token,
          user: normalizedUser
        };
      }
      
      return {
        success: false,
        message: 'Respuesta inválida del servidor'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.data?.error || error.message || 'Email o contraseña incorrectos'
      };
    }
  },

  async logout(): Promise<void> {
    // Logout es solo local, no requiere llamada al backend
    clearSession();
  },

  async getMe(): Promise<UserWithProfile> {
    const response = await get<UserWithProfile>('/api/auth/me');
    return response;
  },

  async updateMe(data: Partial<User>): Promise<User> {
    const response = await put<User>('/api/auth/me', data);
    setUserData(response);
    return response;
  },

  async updateProviderProfile(data: Partial<ProviderProfile>): Promise<ProviderProfile> {
    const response = await put<UserWithProfile>('/api/auth/me', { providerProfile: data });
    return response.providerProfile!;
  },

  async listProviders(params?: ListProvidersParams): Promise<Provider[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.zona) {
      queryParams.append('zona', params.zona);
    }
    
    if (params?.servicio) {
      queryParams.append('servicio', params.servicio);
    }
    
    const endpoint = `/api/providers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await get<Provider[]>(endpoint);
    return response;
  },

  async createRequest(data: CreateRequestData): Promise<ServiceRequest> {
    const response = await post<ServiceRequest>('/api/requests', data);
    return response;
  },

  async listRequests(filter: RequestFilter): Promise<ServiceRequest[]> {
    const endpoint = `/api/requests?as=${filter}`;
    const response = await get<ServiceRequest[]>(endpoint);
    return response;
  },

  async updateRequest(id: string, data: UpdateRequestData): Promise<ServiceRequest> {
    const response = await patch<ServiceRequest>(`/api/requests/${id}`, data);
    return response;
  }
};
