export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
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

const USERS_KEY = 'sf_users';
const USER_KEY = 'sf_user';
const SESSION_KEY = 'sf_session';
const PROVIDER_PROFILES_KEY = 'sf_providerProfiles';
const SEEDED_KEY = 'sf_seeded';

// Get all users
function getAllUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

// Save all users
function saveAllUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get all provider profiles
function getAllProviderProfiles(): ProviderProfile[] {
  const data = localStorage.getItem(PROVIDER_PROFILES_KEY);
  return data ? JSON.parse(data) : [];
}

// Save all provider profiles
function saveAllProviderProfiles(profiles: ProviderProfile[]): void {
  localStorage.setItem(PROVIDER_PROFILES_KEY, JSON.stringify(profiles));
}

// Find user by email
function findUserByEmail(email: string): User | null {
  const users = getAllUsers();
  return users.find(u => u.email === email) || null;
}

export function saveUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): User | null {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

export function updateUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  // Also update in users list
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
    saveAllUsers(users);
  }
}

export function getProviderProfile(): ProviderProfile | null {
  const user = getUser();
  if (!user || user.role !== 'provider') return null;
  
  const profiles = getAllProviderProfiles();
  return profiles.find(p => p.userId === user.id) || null;
}

export function saveProviderProfile(profile: ProviderProfile): void {
  const profiles = getAllProviderProfiles();
  const index = profiles.findIndex(p => p.userId === profile.userId);
  
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  
  saveAllProviderProfiles(profiles);
}

export function updateProviderProfile(profile: Partial<ProviderProfile>): void {
  const current = getProviderProfile();
  if (current) {
    saveProviderProfile({ ...current, ...profile });
  }
}

export function setSession(email: string): void {
  localStorage.setItem(SESSION_KEY, email);
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getSession();
}

export function validateEmail(email: string): boolean {
  if (email === 'admin' || email === 'vicen') return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function login(email: string, password: string): boolean {
  // Find user in users list
  const user = findUserByEmail(email);
  
  if (user && user.password === password) {
    setSession(email);
    saveUser(user);
    return true;
  }
  
  return false;
}

export function register(
  name: string,
  email: string,
  password: string,
  role: 'client' | 'provider',
  providerProfile?: Partial<ProviderProfile>
): boolean {
  if (!name || !validateEmail(email) || !password) {
    return false;
  }
  
  const users = getAllUsers();
  const userId = `user_${Date.now()}`;
  
  const user: User = { 
    id: userId,
    name, 
    email, 
    password, 
    role,
    avatar: '👤'
  };
  
  users.push(user);
  saveAllUsers(users);
  saveUser(user);
  setSession(email);
  
  if (role === 'provider' && providerProfile) {
    const profile: ProviderProfile = {
      userId,
      zona: providerProfile.zona || '',
      servicios: providerProfile.servicios || [],
      experiencia: providerProfile.experiencia || 0,
      descripcion: providerProfile.descripcion || '',
      telefono: providerProfile.telefono || '',
      disponible: providerProfile.disponible ?? true,
      disponibilidad: providerProfile.disponibilidad || 'Entre 24 y 48 hs',
      perfilActivo: providerProfile.perfilActivo ?? true
    };
    saveProviderProfile(profile);
  }
  
  return true;
}

export function getCurrentUserName(): string {
  const user = getUser();
  return user?.name || '';
}

// Seed initial data
export function seedDemoData(): void {
  // Check if already seeded
  if (localStorage.getItem(SEEDED_KEY)) {
    return;
  }
  
  const users: User[] = [
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
  
  // Mark as seeded
  localStorage.setItem(SEEDED_KEY, 'true');
}
