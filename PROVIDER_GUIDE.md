# Guía del Sistema de Proveedores - ServiceFinder

## Descripción General

El sistema de proveedores de ServiceFinder implementa un modelo de **doble rol**: los usuarios con rol "provider" funcionan como clientes normales (pueden buscar y solicitar servicios) Y además tienen capacidades de proveedor (reciben solicitudes, pueden aceptarlas/rechazarlas).

## Características Implementadas

### 1. **Autenticación Multi-Usuario**
- Sistema de almacenamiento basado en arrays (`sf_users`, `sf_providerProfiles`)
- Cada usuario tiene un ID único generado como `user_${Date.now()}`
- Los perfiles de proveedor están vinculados a usuarios mediante `userId`

### 2. **Cuenta de Demostración**
Para probar el sistema de proveedores, usa estas credenciales:
- **Usuario:** `vicen`
- **Contraseña:** `vicen`
- **Tipo:** Provider (Plomero + Gasista)
- **Zona:** Palermo

### 3. **Provider Inbox** (`/inbox`)
Los proveedores tienen acceso a una bandeja de entrada donde pueden:
- Ver todas las solicitudes recibidas
- Filtrar por estado: Todas, Pendientes, Aceptadas, Rechazadas
- **Aceptar** solicitudes pendientes (botón verde)
- **Rechazar** solicitudes pendientes (botón rojo)
- Ver un botón **Mensaje** (placeholder para futura funcionalidad de chat)

### 4. **Navegación Condicional**
- El menú de usuario muestra "Solicitudes recibidas" solo para providers
- Los proveedores también tienen acceso a "Mis solicitudes" (como clientes)

### 5. **Datos de Demostración**
El sistema carga automáticamente:
- **Usuario provider "vicen"** con perfil completo
- **3 solicitudes de demostración:**
  1. Plomería urgente (hace 2 horas) - Pendiente
  2. Inspección de gas (hace 5 horas) - Pendiente
  3. Instalación de calefón (hace 1 día) - Aceptada

## Arquitectura Técnica

### Archivos Modificados

#### 1. `src/lib/auth.ts`
- **Nueva interfaz User:** agregado campo `id: string`
- **Nueva interfaz ProviderProfile:** agregado campo `userId: string`
- **Funciones agregadas:**
  - `getAllUsers()` / `saveAllUsers()`
  - `getAllProviderProfiles()` / `saveAllProviderProfiles()`
  - `findUserByEmail(email)`
  - `seedDemoData()` - crea usuario vicen con perfil

#### 2. `src/lib/requests.ts`
- **Funciones agregadas:**
  - `getProviderRequests(providerId)` - filtra requests por provider
  - `seedDemoRequests(providerId)` - crea 3 requests de demo

#### 3. `src/pages/ProviderInbox.tsx` (NUEVO)
- Página completa de inbox para proveedores
- Sistema de filtros por estado
- Botones Aceptar/Rechazar para requests pendientes
- Modal informativo para funcionalidad de mensajería (próximamente)
- Diseño consistente con el resto de la app (gray-200 background, blue-600 accents)

#### 4. `src/components/UserMenu.tsx`
- Agregado estado `isProvider`
- Item "Solicitudes recibidas" visible solo para providers
- Icono `Inbox` de lucide-react

#### 5. `src/App.tsx`
- Agregada ruta `/inbox` con `ProtectedRoute`
- `useEffect` que ejecuta seed data en primera carga
- Flag `sf_seeded` en localStorage para evitar duplicación

#### 6. `src/pages/Profile.tsx`
- Corregido para incluir `userId` al guardar provider profile

#### 7. `src/pages/Login.tsx`
- Corregido tipo de `providerProfile` a `Partial<ProviderProfile>`
- Agregados campos `disponibilidad` y `perfilActivo`

## Flujo de Usuario Provider

### Como Proveedor (recibiendo solicitudes):
1. Login con cuenta provider
2. Ir a menú usuario → "Solicitudes recibidas"
3. Ver lista de requests donde `request.providerId === user.id`
4. Para solicitudes **Pendientes**:
   - Click en "Aceptar" → cambia estado a "Aceptada"
   - Click en "Rechazar" → cambia estado a "Rechazada"
5. Click en "Mensaje" → modal informativo (funcionalidad futura)

### Como Cliente (solicitando servicios):
1. El mismo provider puede usar la búsqueda normal
2. Ir a Home, seleccionar zona/servicio
3. Solicitar servicio a otros proveedores
4. Ver sus propias solicitudes en "Mis solicitudes"

## Estados de Solicitudes

- **Pendiente:** Recién creada, esperando respuesta del proveedor
- **Aceptada:** Provider aceptó, listo para coordinar servicio
- **Rechazada:** Provider rechazó la solicitud
- **Cancelada:** Cliente canceló la solicitud
- **Completada:** Servicio finalizado (implementación futura)

## Próximas Funcionalidades

- [ ] Sistema de mensajería real (actualmente placeholder)
- [ ] Notificaciones push cuando llega nueva solicitud
- [ ] Historial de servicios completados
- [ ] Sistema de calificaciones y reseñas
- [ ] Dashboard de estadísticas para proveedores
- [ ] Calendario de disponibilidad

## Estructura de Datos

### LocalStorage Keys
- `sf_users` - Array de todos los usuarios
- `sf_user` - Usuario actualmente logueado
- `sf_session` - Email del usuario en sesión
- `sf_providerProfiles` - Array de perfiles de proveedores
- `sf_requests` - Array de todas las solicitudes
- `sf_seeded` - Flag booleano para seed data

### User Interface
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'client' | 'provider';
  avatar?: string;
}
```

### ProviderProfile Interface
```typescript
interface ProviderProfile {
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
```

### ServiceRequest Interface
```typescript
interface ServiceRequest {
  id: string;
  userId: string;
  userEmail: string;
  providerId: string;
  providerName: string;
  providerService: string;
  zona: string;
  urgencia: string;
  descripcion?: string;
  direccion?: string;
  referencias?: string;
  contactoPreferido: 'Email' | 'Teléfono';
  estado: 'Pendiente' | 'Aceptada' | 'Cancelada' | 'Rechazada' | 'Completada';
  fecha: string;
}
```

## Testing

### Test Manual Recomendado:
1. **Limpiar localStorage:** Borrar todo para empezar fresco
2. **Refresh app:** Se ejecutará seed automáticamente
3. **Login como vicen/vicen**
4. **Verificar inbox:** Deberías ver 3 solicitudes de demo
5. **Test Accept:** Click en "Aceptar" en primera solicitud
6. **Test Reject:** Click en "Rechazar" en segunda solicitud
7. **Test Message:** Click en "Mensaje" → debe mostrar modal
8. **Test filters:** Probar cada filtro (Todas, Pendientes, etc.)
9. **Test dual role:** Ir a Home, intentar buscar/solicitar como cliente
10. **Logout y re-login:** Verificar persistencia de datos

## Notas de Implementación

- Los proveedores NO pueden aceptar/rechazar sus propias solicitudes
- El sistema previene duplicación de seed data con flag `sf_seeded`
- Todas las fechas se manejan en formato ISO (toISOString())
- El sorting de requests es descendente (más nuevas primero)
- Los botones de acción solo aparecen en estado "Pendiente"
- El diseño mantiene consistencia con resto de la app (Tailwind classes)

---

**Desarrollado como MVP para ServiceFinder** 🔧
