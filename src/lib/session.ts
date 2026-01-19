/**
 * Centraliza el manejo de sesión y tokens.
 * Facilita migración futura de localStorage a cookies httpOnly sin tocar la UI.
 */

const TOKEN_KEY = 'sf_auth_token';
const USER_KEY = 'sf_user';
const SESSION_EMAIL_KEY = 'sf_session';

export interface SessionData {
  token?: string;
  userEmail: string;
}

/**
 * Guarda el token de autenticación
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Obtiene el token de autenticación
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Elimina el token de autenticación
 */
export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Establece la sesión del usuario (email para compatibilidad con sistema actual)
 */
export function setSession(email: string): void {
  localStorage.setItem(SESSION_EMAIL_KEY, email);
}

/**
 * Obtiene el email de la sesión activa
 */
export function getSession(): string | null {
  return localStorage.getItem(SESSION_EMAIL_KEY);
}

/**
 * Verifica si hay una sesión activa
 */
export function isAuthenticated(): boolean {
  return !!getSession();
}

/**
 * Cierra la sesión y limpia todos los datos
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_EMAIL_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Guarda datos del usuario en localStorage (compatibilidad con sistema actual)
 */
export function setUserData(userData: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

/**
 * Obtiene datos del usuario desde localStorage
 */
export function getUserData(): any | null {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}
