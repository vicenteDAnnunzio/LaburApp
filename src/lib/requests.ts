import type { ServiceRequest } from '../types/request';

const REQUESTS_KEY = 'sf_requests';

export function saveRequest(request: ServiceRequest): void {
  const requests = getRequests();
  requests.push(request);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export function getRequests(): ServiceRequest[] {
  try {
    const data = localStorage.getItem(REQUESTS_KEY);
    if (!data) return [];
    
    const requests = JSON.parse(data) as any[];
    
    // Migrar requests antiguos que no tienen metodoPago
    const migratedRequests = requests.map(req => {
      if (!req.metodoPago) {
        return {
          ...req,
          metodoPago: 'Indiferente',
          direccion: req.direccion || 'No especificada'
        };
      }
      return req;
    });
    
    return migratedRequests as ServiceRequest[];
  } catch (error) {
    console.error('Error loading requests:', error);
    // Si hay un error, limpiar el localStorage corrupto
    localStorage.removeItem(REQUESTS_KEY);
    return [];
  }
}

export function getUserRequests(userEmail: string): ServiceRequest[] {
  try {
    const requests = getRequests();
    return requests.filter(req => req.userEmail === userEmail);
  } catch (error) {
    console.error('Error getting user requests:', error);
    return [];
  }
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
  try {
    const requests = getRequests();
    return requests.filter(req => req.providerId === providerId);
  } catch (error) {
    console.error('Error getting provider requests:', error);
    return [];
  }
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
      metodoPago: 'Efectivo',
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
      direccion: 'Arenales 1500',
      metodoPago: 'Transferencia',
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
      metodoPago: 'Indiferente',
      estado: 'Aceptada',
      fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      userEmail: 'cliente3@mail.com'
    }
  ];
  
  demoRequests.forEach(req => saveRequest(req));
}

