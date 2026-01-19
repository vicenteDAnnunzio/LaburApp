/**
 * Cliente HTTP centralizado para comunicación con el backend.
 * Maneja autenticación, errores y parseo de respuestas de forma consistente.
 */

import { getAuthToken } from './session';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;

  constructor(status: number, statusText: string, data?: any) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

/**
 * Realiza una petición HTTP con manejo consistente de errores
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, headers = {}, ...fetchOptions } = options;

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Agregar token de autenticación si está disponible y es requerido
  if (auth) {
    const token = getAuthToken();
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    // Intentar parsear el cuerpo de la respuesta
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Error de red u otro error
    if (error instanceof Error) {
      throw new ApiError(0, error.message);
    }

    throw new ApiError(0, 'Unknown error');
  }
}

/**
 * GET request
 */
export async function get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export async function post<T>(
  endpoint: string,
  body?: any,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export async function put<T>(
  endpoint: string,
  body?: any,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request
 */
export async function patch<T>(
  endpoint: string,
  body?: any,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'DELETE' });
}
