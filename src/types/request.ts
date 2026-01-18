export interface ServiceRequest {
  id: string;
  providerId: string;
  providerName: string;
  providerService: string;
  providerZona: string;
  zona: string;
  urgencia: UrgenciaOption;
  descripcion?: string;
  direccion?: string;
  referencias?: string;
  contactoPreferido: 'Email' | 'Teléfono';
  estado: 'Pendiente' | 'Aceptada' | 'Cancelada' | 'Rechazada' | 'Completada';
  fecha: string;
  userEmail: string;
}

export type UrgenciaOption = 
  | 'Lo antes posible (hoy / < 24 hs)' 
  | 'Entre 24 y 48 hs' 
  | 'Entre 48 y 72 hs' 
  | 'Esta semana';
export type ContactoOption = 'Email' | 'Teléfono';
export type EstadoRequest = 'Pendiente' | 'Aceptada' | 'Cancelada' | 'Rechazada' | 'Completada';
