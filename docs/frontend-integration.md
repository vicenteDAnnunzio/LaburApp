# Guía de Integración Frontend-Backend

## Visión General

El frontend de ServiceFinder está completamente preparado para integrarse con un backend real mediante una arquitectura de adaptadores. La UI consume una **capa de API unificada** (`src/data/api.ts`) que puede funcionar con dos adaptadores:

- **mockAdapter** (por defecto): Simula datos usando localStorage y mocks
- **httpAdapter**: Conecta con un backend real vía HTTP/REST

## Arquitectura de Datos

```
UI Components (pages/, components/)
         ↓
    src/data/api.ts (capa unificada)
         ↓
    Selector de adaptador (src/config/)
         ↓
    ┌──────────────┬────────────────┐
    ↓              ↓                ↓
mockAdapter   httpAdapter    (futuros...)
    ↓              ↓
localStorage   Backend API
```

## Cambio de Mock a Backend Real

### Opción 1: Variable de Entorno (Recomendado)

1. Crear archivo `.env` en la raíz del proyecto:

```bash
VITE_DATA_ADAPTER=http
VITE_API_URL=http://localhost:3000/api
```

2. Reiniciar el servidor de desarrollo:

```bash
npm run dev
```

### Opción 2: Configuración Manual

Editar `src/config/index.ts`:

```typescript
export const config: AppConfig = {
  dataAdapter: 'http', // Cambiar de 'mock' a 'http'
  apiUrl: 'http://localhost:3000/api',
  // ...
};
```

## Endpoints Esperados por el Backend

El `httpAdapter` espera los siguientes endpoints REST:

### Autenticación

```
POST   /auth/register
Body:  {
  name: string,
  email: string,
  password: string,
  role: 'client' | 'provider',
  providerProfile?: {
    zona: string,
    servicios: string[],
    experiencia: number,
    descripcion?: string,
    telefono?: string,
    disponibilidad?: string,
    perfilActivo?: boolean
  }
}
Response: {
  success: boolean,
  token?: string,
  user?: User,
  message?: string
}

POST   /auth/login
Body:  { email: string, password: string }
Response: {
  success: boolean,
  token?: string,
  user?: User,
  message?: string
}

LOGOUT (solo local - sin endpoint)
El logout se maneja únicamente en el frontend limpiando la sesión.
No requiere llamada al backend.
```

### Usuario

```
GET    /me
Headers: Authorization: Bearer <token>
Response: {
  id: string,
  name: string,
  email: string,
  role: 'client' | 'provider',
  avatar?: string,
  providerProfile?: ProviderProfile
}

PUT    /me
Headers: Authorization: Bearer <token>
Body:  {
  name?: string,
  avatar?: string,
  providerProfile?: {
    zona?: string,
    servicios?: string[],
    experiencia?: number,
    descripcion?: string,
    telefono?: string,
    disponibilidad?: string,
    perfilActivo?: boolean
  }
}
Response: {
  id: string,
  name: string,
  email: string,
  role: 'client' | 'provider',
  avatar?: string,
  providerProfile?: ProviderProfile
}
```

### Proveedores

```
GET    /providers?zona=<zona>&servicio=<servicio>
Response: Provider[]

Provider: {
  id: string,  // UUID del proveedor
  name: string,
  service: string,
  zona: string,
  experience: number,
  available: boolean
}
```

### Solicitudes

```
POST   /requests
Headers: Authorization: Bearer <token>
Body:  {
  providerId: string,
  providerName: string,
  providerService: string,
  providerZona: string,
  zona: string,
  urgencia: UrgenciaOption,
  descripcion?: string,
  direccion: string,
  referencias?: string,
  metodoPago: MetodoPagoOption
}
Response: ServiceRequest

GET    /requests?as=client
GET    /requests?as=provider
Headers: Authorization: Bearer <token>
Query:  as=client|provider
Response: ServiceRequest[]

PATCH  /requests/:id
Headers: Authorization: Bearer <token>
Body:  { action: "accept" | "reject" | "cancel" }
Response: ServiceRequest
Note: Este endpoint maneja las acciones de aceptar, rechazar y cancelar solicitudes.

ServiceRequest: {
  id: string,
  providerId: string,
  providerName: string,
  providerService: string,
  providerZona: string,
  zona: string,
  urgencia: UrgenciaOption,
  descripcion?: string,
  direccion: string,
  referencias?: string,
  metodoPago: MetodoPagoOption,
  estado: 'Pendiente' | 'Aceptada' | 'Cancelada' | 'Rechazada' | 'Completada',
  fecha: string,
  userEmail: string
}
```

## Tipos de Datos

Ver definiciones completas en:
- `src/data/types.ts` - Tipos de la API
- `src/types.ts` - Tipos del dominio (Provider)
- `src/types/request.ts` - Tipos de solicitudes

## Manejo de Autenticación

### Token JWT

El frontend espera recibir un token JWT en la respuesta de login/register:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

El token se envía automáticamente en todas las peticiones autenticadas:

```
Authorization: Bearer <token>
```

### Sesión

El `httpClient` en `src/lib/httpClient.ts` maneja automáticamente:
- Adjuntar el token en el header `Authorization`
- Parseo de respuestas JSON
- Manejo consistente de errores

La gestión de sesión está centralizada en `src/lib/session.ts`, facilitando migración futura a cookies httpOnly.

## Desarrollo Local

### Frontend Solo (Mock)

```bash
# Terminal 1 - Frontend
cd servicefinder
npm run dev
# http://localhost:5173
```

### Frontend + Backend

```bash
# Terminal 1 - Backend
cd servicefinder/backend
npm run dev
# http://localhost:4000

# Terminal 2 - Frontend
cd servicefinder
# Crear .env con VITE_DATA_ADAPTER=http
npm run dev
# http://localhost:5173
```

### Configuración CORS

El backend debe permitir peticiones desde `http://localhost:5173`:

```typescript
// backend/src/app.ts
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

## Errores Comunes

### Error de Conexión

```
HTTP 0: Failed to fetch
```

**Solución**: Verificar que el backend esté corriendo y accesible en la URL configurada.

### Error 401 Unauthorized

**Solución**: El token expiró o es inválido. El usuario debe hacer login nuevamente.

### Error de CORS

```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solución**: Configurar CORS en el backend (ver arriba).

## Testing de la Integración

### 1. Verificar Adaptador Activo

Abrir consola del navegador:

```javascript
import { getCurrentAdapter } from './src/data/api';
console.log(getCurrentAdapter()); // Debe mostrar 'http'
```

### 2. Test de Endpoints

Usar las páginas de la UI:
- **Login**: `/login` → debe llamar a `POST /auth/login`
- **Register**: `/login` (tab Registro) → debe llamar a `POST /auth/register`
- **Home**: `/home` → debe llamar a `GET /providers`
- **Profile**: `/profile` → debe llamar a `GET /auth/me` y `PUT /users/me`
- **Solicitudes**: `/solicitudes` → debe llamar a `GET /requests?filter=client`

### 3. Monitor de Red

Abrir DevTools → Network → Filtrar por "Fetch/XHR" para ver todas las peticiones al backend.

## Estructura de Archivos Clave

```
src/
├── config/
│   └── index.ts              # Configuración y selector de adaptador
├── data/
│   ├── api.ts                # Capa de API unificada (PUNTO ÚNICO DE ACCESO)
│   ├── types.ts              # Contratos y tipos de la API
│   ├── mockProviders.ts      # Datos mock de proveedores
│   └── adapters/
│       ├── mockAdapter.ts    # Implementación mock (localStorage)
│       └── httpAdapter.ts    # Implementación HTTP (backend real)
├── lib/
│   ├── httpClient.ts         # Cliente HTTP con manejo de errores
│   ├── session.ts            # Gestión centralizada de sesión/token
│   ├── auth.ts               # [DEPRECADO - mantener por compatibilidad]
│   ├── requests.ts           # [DEPRECADO - mantener por compatibilidad]
│   └── validation.ts         # Validaciones de formularios
└── pages/
    ├── Login.tsx             # Usa api.login() y api.register()
    ├── Home.tsx              # Usa api.listProviders()
    ├── Profile.tsx           # Usa api.getMe(), api.updateMe()
    ├── Solicitudes.tsx       # Usa api.listRequests('client')
    └── ProviderInbox.tsx     # Usa api.listRequests('provider')
```

## Migración Futura (Sin Cambios en UI)

Gracias a la arquitectura de adaptadores, se pueden realizar cambios sin tocar la UI:

### Migrar de localStorage a Cookies httpOnly

Editar `src/lib/session.ts`:

```typescript
export function setAuthToken(token: string): void {
  // En lugar de localStorage
  // localStorage.setItem(TOKEN_KEY, token);
  
  // Usar cookies (backend las establece)
  // No hacer nada aquí, el backend manejará la cookie
}

export function getAuthToken(): string | null {
  // Las cookies se envían automáticamente
  return null; // El backend lee la cookie
}
```

### Agregar GraphQL

Crear `src/data/adapters/graphqlAdapter.ts` e implementar la interfaz `DataAdapter`.

### Agregar Cache/Offline

Crear `src/data/adapters/cachedHttpAdapter.ts` que envuelva `httpAdapter`.

## Notas Importantes

1. **IDs son strings**: Todos los IDs (user.id, provider.id, request.id) se manejan como strings para máxima flexibilidad.

2. **No hay cambios visuales**: La UI/UX es **exactamente la misma** en modo mock y modo HTTP.

3. **Compatibilidad con sistema actual**: Los archivos `src/lib/auth.ts` y `src/lib/requests.ts` ya no se usan en la UI pero se mantienen para referencia.

4. **Validaciones**: Las validaciones de formulario permanecen en el frontend (`src/lib/validation.ts`), el backend debe realizar sus propias validaciones.

## Contacto y Soporte

Para dudas sobre la integración, revisar:
- Tipos: `src/data/types.ts`
- Implementación HTTP: `src/data/adapters/httpAdapter.ts`
- Cliente HTTP: `src/lib/httpClient.ts`
