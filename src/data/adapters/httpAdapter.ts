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
 * POST   /auth/register
 * POST   /auth/login
 * Logout: solo local (sin endpoint)
 * GET    /me
 * 
 * PUT    /me
 * 
 * GET    /providers?zona=X&servicio=Y
 * 
 * POST   /requests
 * GET    /requests?as=client
 * GET    /requests?as=provider
 * PATCH  /requests/:id  { action: "accept" | "reject" | "cancel" }
 */
export const httpAdapter: DataAdapter = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await post<AuthResponse>('/auth/register', data, { auth: false });
      
      if (response.success && response.token && response.user) {
        setAuthToken(response.token);
        setSession(response.user.email);
        setUserData(response.user);
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.data?.message || error.message || 'Error en el registro'
      };
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await post<AuthResponse>('/auth/login', data, { auth: false });
      
      if (response.success && response.token && response.user) {
        setAuthToken(response.token);
        setSession(response.user.email);
        setUserData(response.user);
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.data?.message || error.message || 'Error en el login'
      };
    }
  },

  async logout(): Promise<void> {
    // Logout es solo local, no requiere llamada al backend
    clearSession();
  },

  async getMe(): Promise<UserWithProfile> {
    const response = await get<UserWithProfile>('/me');
    return response;
  },

  async updateMe(data: Partial<User>): Promise<User> {
    const response = await put<User>('/me', data);
    setUserData(response);
    return response;
  },

  async updateProviderProfile(data: Partial<ProviderProfile>): Promise<ProviderProfile> {
    const response = await put<UserWithProfile>('/me', { providerProfile: data });
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
    
    const endpoint = `/providers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await get<Provider[]>(endpoint);
    return response;
  },

  async createRequest(data: CreateRequestData): Promise<ServiceRequest> {
    const response = await post<ServiceRequest>('/requests', data);
    return response;
  },

  async listRequests(filter: RequestFilter): Promise<ServiceRequest[]> {
    const endpoint = `/requests?as=${filter}`;
    const response = await get<ServiceRequest[]>(endpoint);
    return response;
  },

  async updateRequest(id: string, data: UpdateRequestData): Promise<ServiceRequest> {
    const response = await patch<ServiceRequest>(`/requests/${id}`, data);
    return response;
  }
};
