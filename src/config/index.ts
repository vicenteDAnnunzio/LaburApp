/**
 * Configuración centralizada de la aplicación.
 * Maneja variables de entorno y selección de adaptador de datos.
 */

export type DataAdapter = 'mock' | 'http';

interface AppConfig {
  // Adaptador de datos a usar (mock para desarrollo, http para producción)
  dataAdapter: DataAdapter;
  
  // URL base de la API (solo se usa cuando dataAdapter es 'http')
  apiUrl: string;
  
  // Entorno de ejecución
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Configuración de la aplicación basada en variables de entorno
 */
export const config: AppConfig = {
  // Por defecto usa mock, cambiar a 'http' cuando el backend esté disponible
  dataAdapter: (import.meta.env.VITE_DATA_ADAPTER as DataAdapter) || 'mock',
  
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

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
