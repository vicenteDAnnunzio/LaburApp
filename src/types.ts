export interface Provider {
  id: string;
  name: string;
  service: string;
  zona: string;
  experience: number;
  available: boolean;
}

export type Zona = 'Palermo' | 'Recoleta' | 'Belgrano' | 'Caballito' | 'Almagro' | 'Flores' | 'Villa Urquiza' | 'San Telmo' | 'Microcentro';

export type Service = 'Plomero' | 'Electricista' | 'Gasista' | 'Jardinero' | 'Pintor' | 'Carpintero' | 'Cerrajero';
