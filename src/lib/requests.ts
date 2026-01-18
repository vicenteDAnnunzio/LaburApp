import type { ServiceRequest } from '../types/request';

const REQUESTS_KEY = 'sf_requests';

export function saveRequest(request: ServiceRequest): void {
  const requests = getRequests();
  requests.push(request);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export function getRequests(): ServiceRequest[] {
  const data = localStorage.getItem(REQUESTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getUserRequests(userEmail: string): ServiceRequest[] {
  const requests = getRequests();
  return requests.filter(req => req.userEmail === userEmail);
}

export function updateRequestStatus(requestId: string, estado: ServiceRequest['estado']): void {
  const requests = getRequests();
  const index = requests.findIndex(req => req.id === requestId);
  if (index !== -1) {
    requests[index].estado = estado;
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  }
}

export function getProviderRequests(providerId: string): ServiceRequest[] {
  const requests = getRequests();
  return requests.filter(req => req.providerId === providerId);
}

// Seed demo requests for provider
export function seedDemoRequests(providerId: string): void {
  const existingRequests = getRequests();
  
  // Only seed if no requests exist for this provider
  if (existingRequests.some(r => r.providerId === providerId)) {
    return;
  }
  
  const demoRequests: ServiceRequest[] = [
    {
      id: `req_demo_${Date.now()}_1`,
      providerId,
      providerName: 'Vicente García',
      providerService: 'Plomero',
      providerZona: 'Palermo',
      zona: 'Palermo',
      urgencia: 'Lo antes posible (hoy / < 24 hs)',
      descripcion: 'Pérdida de agua en el baño. Necesito que vengan urgente.',
      direccion: 'Thames 1234, Piso 3, Depto B',
      referencias: 'Edificio de ladrillo, portón verde',
      contactoPreferido: 'Teléfono',
      estado: 'Pendiente',
      fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      userEmail: 'cliente1@mail.com'
    },
    {
      id: `req_demo_${Date.now()}_2`,
      providerId,
      providerName: 'Vicente García',
      providerService: 'Gasista',
      providerZona: 'Palermo',
      zona: 'Palermo',
      urgencia: 'Entre 24 y 48 hs',
      descripcion: 'Revisión de instalación de gas y certificado',
      contactoPreferido: 'Email',
      estado: 'Pendiente',
      fecha: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      userEmail: 'cliente2@mail.com'
    },
    {
      id: `req_demo_${Date.now()}_3`,
      providerId,
      providerName: 'Vicente García',
      providerService: 'Plomero',
      providerZona: 'Palermo',
      zona: 'Recoleta',
      urgencia: 'Esta semana',
      descripcion: 'Instalación de termotanque nuevo',
      direccion: 'Av. Santa Fe 2500',
      contactoPreferido: 'Teléfono',
      estado: 'Aceptada',
      fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      userEmail: 'cliente3@mail.com'
    }
  ];
  
  demoRequests.forEach(req => saveRequest(req));
}

