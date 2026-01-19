/**
 * Adaptador mock que simula llamadas al backend usando localStorage.
 * Mantiene toda la lógica actual del sistema sin cambios.
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
import { mockProviders } from '../mockProviders';
import { setSession, clearSession, setUserData, getUserData } from '../../lib/session';
import { validateEmail } from '../../lib/validation';

// Keys de localStorage (compatibilidad con sistema actual)
const USERS_KEY = 'sf_users';
const PROVIDER_PROFILES_KEY = 'sf_providerProfiles';
const REQUESTS_KEY = 'sf_requests';
const SEEDED_KEY = 'sf_seeded';

// ==================== HELPERS ====================

interface StoredUser extends User {
  password: string;
}

function getAllUsers(): StoredUser[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAllUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getAllProviderProfiles(): ProviderProfile[] {
  const data = localStorage.getItem(PROVIDER_PROFILES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAllProviderProfiles(profiles: ProviderProfile[]): void {
  localStorage.setItem(PROVIDER_PROFILES_KEY, JSON.stringify(profiles));
}

function findUserByEmail(email: string): StoredUser | null {
  const users = getAllUsers();
  return users.find(u => u.email === email) || null;
}

function getAllRequests(): ServiceRequest[] {
  try {
    const data = localStorage.getItem(REQUESTS_KEY);
    if (!data) return [];
    
    const requests = JSON.parse(data) as any[];
    
    // Migrar requests antiguos
    return requests.map(req => {
      if (!req.metodoPago) {
        return {
          ...req,
          metodoPago: 'Indiferente',
          direccion: req.direccion || 'No especificada'
        };
      }
      return req;
    }) as ServiceRequest[];
  } catch (error) {
    console.error('Error loading requests:', error);
    localStorage.removeItem(REQUESTS_KEY);
    return [];
  }
}

function saveAllRequests(requests: ServiceRequest[]): void {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

function getCurrentUser(): StoredUser | null {
  const userData = getUserData();
  if (!userData) return null;
  
  // Verificar que el usuario aún existe en la lista
  const user = findUserByEmail(userData.email);
  return user;
}

function getProviderProfileByUserId(userId: string): ProviderProfile | null {
  const profiles = getAllProviderProfiles();
  return profiles.find(p => p.userId === userId) || null;
}

// Seed data inicial
function seedDemoData(): void {
  if (localStorage.getItem(SEEDED_KEY)) {
    return;
  }
  
  const users: StoredUser[] = [
    {
      id: 'vicen_id',
      name: 'Vicente García',
      email: 'vicen@demo.com',
      password: 'vicente',
      role: 'provider',
      avatar: '👨‍🔧'
    }
  ];
  
  const providerProfiles: ProviderProfile[] = [
    {
      userId: 'vicen_id',
      zona: 'Palermo',
      servicios: ['Plomero', 'Gasista'],
      experiencia: 12,
      descripcion: 'Plomero y gasista matriculado con más de 12 años de experiencia. Atiendo urgencias 24/7.',
      telefono: '+54 11 4567-8900',
      disponible: true,
      disponibilidad: 'Lo antes posible (hoy / < 24 hs)',
      perfilActivo: true
    }
  ];
  
  saveAllUsers(users);
  saveAllProviderProfiles(providerProfiles);
  localStorage.setItem(SEEDED_KEY, 'true');
}

// Simular delay de red
function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== IMPLEMENTACIÓN DEL ADAPTADOR ====================

export const mockAdapter: DataAdapter = {
  async register(data: RegisterData): Promise<AuthResponse> {
    await delay();
    seedDemoData();
    
    if (!data.name || !validateEmail(data.email) || !data.password) {
      return { success: false, message: 'Datos inválidos' };
    }
    
    // Verificar si el usuario ya existe
    if (findUserByEmail(data.email)) {
      return { success: false, message: 'El email ya está registrado' };
    }
    
    const users = getAllUsers();
    const userId = `user_${Date.now()}`;
    
    const newUser: StoredUser = {
      id: userId,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      avatar: '👤'
    };
    
    users.push(newUser);
    saveAllUsers(users);
    
    // Guardar perfil de proveedor si aplica
    if (data.role === 'provider' && data.providerProfile) {
      const profile: ProviderProfile = {
        userId,
        zona: data.providerProfile.zona || '',
        servicios: data.providerProfile.servicios || [],
        experiencia: data.providerProfile.experiencia || 0,
        descripcion: data.providerProfile.descripcion || '',
        telefono: data.providerProfile.telefono || '',
        disponible: data.providerProfile.perfilActivo ?? true,
        disponibilidad: data.providerProfile.disponibilidad || 'Entre 24 y 48 hs',
        perfilActivo: data.providerProfile.perfilActivo ?? true
      };
      
      const profiles = getAllProviderProfiles();
      profiles.push(profile);
      saveAllProviderProfiles(profiles);
    }
    
    // Establecer sesión
    const { password, ...userWithoutPassword } = newUser;
    setSession(data.email);
    setUserData(userWithoutPassword);
    
    return { 
      success: true, 
      user: userWithoutPassword,
      token: `mock_token_${userId}` 
    };
  },

  async login(data: LoginData): Promise<AuthResponse> {
    await delay();
    seedDemoData();
    
    const user = findUserByEmail(data.email);
    
    if (user && user.password === data.password) {
      const { password, ...userWithoutPassword } = user;
      setSession(data.email);
      setUserData(userWithoutPassword);
      
      return { 
        success: true, 
        user: userWithoutPassword,
        token: `mock_token_${user.id}` 
      };
    }
    
    return { success: false, message: 'Email o contraseña incorrectos' };
  },

  async logout(): Promise<void> {
    await delay(100);
    clearSession();
  },

  async getMe(): Promise<UserWithProfile> {
    await delay(100);
    
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No autenticado');
    }
    
    const { password, ...userWithoutPassword } = user;
    
    if (user.role === 'provider') {
      const profile = getProviderProfileByUserId(user.id);
      return {
        ...userWithoutPassword,
        providerProfile: profile || undefined
      };
    }
    
    return userWithoutPassword;
  },

  async updateMe(data: Partial<User>): Promise<User> {
    await delay();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No autenticado');
    }
    
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === currentUser.id);
    
    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    const updatedUser: StoredUser = {
      ...users[index],
      ...data,
      id: currentUser.id, // No permitir cambiar el ID
      email: currentUser.email, // No permitir cambiar el email
    };
    
    users[index] = updatedUser;
    saveAllUsers(users);
    
    const { password, ...userWithoutPassword } = updatedUser;
    setUserData(userWithoutPassword);
    
    return userWithoutPassword;
  },

  async updateProviderProfile(data: Partial<ProviderProfile>): Promise<ProviderProfile> {
    await delay();
    
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'provider') {
      throw new Error('No autorizado');
    }
    
    const profiles = getAllProviderProfiles();
    const index = profiles.findIndex(p => p.userId === currentUser.id);
    
    let updatedProfile: ProviderProfile;
    
    if (index === -1) {
      // Crear nuevo perfil
      updatedProfile = {
        userId: currentUser.id,
        zona: data.zona || '',
        servicios: data.servicios || [],
        experiencia: data.experiencia || 0,
        descripcion: data.descripcion || '',
        telefono: data.telefono || '',
        disponible: data.disponible ?? true,
        disponibilidad: data.disponibilidad || 'Entre 24 y 48 hs',
        perfilActivo: data.perfilActivo ?? true
      };
      profiles.push(updatedProfile);
    } else {
      // Actualizar existente
      updatedProfile = {
        ...profiles[index],
        ...data,
        userId: currentUser.id // No permitir cambiar el userId
      };
      profiles[index] = updatedProfile;
    }
    
    saveAllProviderProfiles(profiles);
    return updatedProfile;
  },

  async listProviders(params?: ListProvidersParams): Promise<Provider[]> {
    await delay(200);
    
    let results = [...mockProviders];
    
    if (params?.zona) {
      results = results.filter(p => p.zona === params.zona);
    }
    
    if (params?.servicio) {
      results = results.filter(p => p.service === params.servicio);
    }
    
    return results;
  },

  async createRequest(data: CreateRequestData): Promise<ServiceRequest> {
    await delay();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No autenticado');
    }
    
    const request: ServiceRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      providerId: data.providerId,
      providerName: data.providerName,
      providerService: data.providerService,
      providerZona: data.providerZona,
      zona: data.zona,
      urgencia: data.urgencia,
      descripcion: data.descripcion,
      direccion: data.direccion,
      referencias: data.referencias,
      metodoPago: data.metodoPago,
      estado: 'Pendiente',
      fecha: new Date().toISOString(),
      userEmail: currentUser.email
    };
    
    const requests = getAllRequests();
    requests.push(request);
    saveAllRequests(requests);
    
    return request;
  },

  async listRequests(filter: RequestFilter): Promise<ServiceRequest[]> {
    await delay(200);
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No autenticado');
    }
    
    const allRequests = getAllRequests();
    
    let filtered: ServiceRequest[];
    
    if (filter === 'client') {
      filtered = allRequests.filter(r => r.userEmail === currentUser.email);
    } else if (filter === 'provider') {
      if (currentUser.role !== 'provider') {
        throw new Error('No autorizado');
      }
      filtered = allRequests.filter(r => r.providerId === currentUser.id);
    } else {
      // 'all' - solo para admin (por ahora retorna vacío)
      filtered = [];
    }
    
    // Ordenar por fecha descendente
    return filtered.sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  },

  async updateRequest(id: string, data: UpdateRequestData): Promise<ServiceRequest> {
    await delay();
    
    const requests = getAllRequests();
    const index = requests.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error('Solicitud no encontrada');
    }
    
    // Convertir action a estado
    const estadoMap: Record<UpdateRequestData['action'], ServiceRequest['estado']> = {
      accept: 'Aceptada',
      reject: 'Rechazada',
      cancel: 'Cancelada'
    };
    
    const updatedRequest: ServiceRequest = {
      ...requests[index],
      estado: estadoMap[data.action]
    };
    
    requests[index] = updatedRequest;
    saveAllRequests(requests);
    
    return updatedRequest;
  }
};
