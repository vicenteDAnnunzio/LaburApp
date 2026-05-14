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
 * Transforma los datos del backend al formato esperado por el frontend
 */
function transformBackendRequest(backendRequest: any): ServiceRequest {
  // Mapeo de estados del backend al frontend
  const statusMap: Record<string, ServiceRequest['estado']> = {
    'PENDING': 'Pendiente',
    'ACCEPTED': 'Aceptada',
    'CANCELLED': 'Cancelada',
    'REJECTED': 'Rechazada',
    'COMPLETED': 'Completada',
  };

  // Mapeo de urgencia del backend al frontend
  const urgencyMap: Record<string, ServiceRequest['urgencia']> = {
    'HIGH': 'Lo antes posible (hoy / < 24 hs)',
    'MEDIUM': 'Entre 24 y 48 hs',
    'LOW': 'Entre 48 y 72 hs',
  };

  return {
    id: backendRequest.id,
    providerId: backendRequest.providerId,
    providerName: backendRequest.provider?.user?.name || 'Proveedor',
    providerService: backendRequest.provider?.servicios?.[0] || 'Servicio',
    providerZona: backendRequest.provider?.zona || backendRequest.location,
    zona: backendRequest.location,
    urgencia: urgencyMap[backendRequest.urgency] || 'Entre 24 y 48 hs',
    descripcion: backendRequest.description,
    direccion: backendRequest.location,
    referencias: backendRequest.title,
    metodoPago: 'Indiferente',
    estado: statusMap[backendRequest.status] || 'Pendiente',
    fecha: backendRequest.scheduledAt || backendRequest.createdAt,
    userEmail: backendRequest.client?.email || '',
  };
}

/**
 * Transforma los datos del frontend al formato esperado por el backend
 */
function transformFrontendRequest(frontendData: CreateRequestData): any {
  // Mapeo de urgencia del frontend al backend
  const urgencyMap: Record<string, 'HIGH' | 'MEDIUM' | 'LOW'> = {
    'Lo antes posible (hoy / < 24 hs)': 'HIGH',
    'Entre 24 y 48 hs': 'MEDIUM',
    'Entre 48 y 72 hs': 'LOW',
    'Esta semana': 'LOW',
  };

  return {
    providerId: frontendData.providerId,
    title: frontendData.referencias || frontendData.providerService,
    description: frontendData.descripcion || 'Sin descripción',
    location: frontendData.direccion,
    urgency: urgencyMap[frontendData.urgencia] || 'MEDIUM',
  };
}

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
    const response = await get<any>('/api/auth/me');
    // Normalizar role de mayúsculas a minúsculas
    if (response.role) {
      response.role = response.role.toLowerCase();
    }
    return response;
  },

  async updateMe(data: Partial<User>): Promise<User> {
    const response = await put<any>('/api/auth/me', data);
    // Normalizar role de mayúsculas a minúsculas
    if (response.role) {
      response.role = response.role.toLowerCase();
    }
    setUserData(response);
    return response;
  },

  async updateProviderProfile(data: Partial<ProviderProfile>): Promise<ProviderProfile> {
    const response = await put<any>('/api/auth/me', { providerProfile: data });
    // Normalizar role de mayúsculas a minúsculas
    if (response.role) {
      response.role = response.role.toLowerCase();
    }
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
    const backendData = transformFrontendRequest(data);
    const response = await post<any>('/api/requests', backendData);
    return transformBackendRequest(response);
  },

  async listRequests(filter: RequestFilter): Promise<ServiceRequest[]> {
    const endpoint = `/api/requests?as=${filter}`;
    const response = await get<any[]>(endpoint);
    return response.map(transformBackendRequest);
  },

  async updateRequest(id: string, data: UpdateRequestData): Promise<ServiceRequest> {
    const response = await patch<any>(`/api/requests/${id}`, data);
    return transformBackendRequest(response);
  }
};
