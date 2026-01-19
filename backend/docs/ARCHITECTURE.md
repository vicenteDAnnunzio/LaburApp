# ServiceFinder Backend - Technical Architecture

## 🏛️ Architecture Pattern

**Layered Architecture (MVC + Services)**

```
┌─────────────────────────────────────────────┐
│            Client (Frontend)                │
└─────────────────┬───────────────────────────┘
                  │ HTTP/JSON
┌─────────────────▼───────────────────────────┐
│         Routes Layer (API Endpoints)        │
│  - Define HTTP methods & paths              │
│  - Apply middleware (auth, validation)      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│       Controllers Layer (Handlers)          │
│  - Extract request data                     │
│  - Call service methods                     │
│  - Format & send responses                  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      Services Layer (Business Logic)        │
│  - Validate business rules                  │
│  - Process data                             │
│  - Coordinate database operations           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│        Database Layer (Prisma ORM)          │
│  - Query database                           │
│  - Manage transactions                      │
│  - Handle relations                         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           PostgreSQL Database               │
└─────────────────────────────────────────────┘
```

## 📂 Directory Structure Explained

### `/src/config`
Configuration and environment settings.

- `env.ts`: Environment variable validation and exports
- `rbac.ts`: Role-Based Access Control definitions

**Purpose:** Centralize all configuration to avoid magic strings and enable easy changes.

### `/src/middleware`
Express middleware functions.

- `auth.middleware.ts`: JWT verification and role checking
- `validation.middleware.ts`: Request validation helpers

**Purpose:** Reusable logic that runs before/after request handlers.

### `/src/routes`
API endpoint definitions.

- Pattern: One file per resource (auth, users, providers, requests)
- Responsibilities:
  - Define HTTP methods (GET, POST, PUT, DELETE)
  - Apply middleware stack
  - Map to controller functions

**Example:**
```typescript
router.post(
  '/',
  authenticate,           // Verify JWT
  requireRole('CLIENT'),  // Check role
  validate([...rules]),   // Validate input
  createRequest           // Controller
);
```

### `/src/controllers`
Request/response handlers.

- Pattern: One file per resource
- Responsibilities:
  - Extract data from `req.body`, `req.params`, `req.query`
  - Call appropriate service methods
  - Send HTTP responses with proper status codes
  - Handle errors gracefully

**Example:**
```typescript
export async function createRequest(req: AuthRequest, res: Response) {
  try {
    const request = await requestService.create(req.user!.id, req.body);
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

### `/src/services`
Business logic and data operations.

- Pattern: One file per domain (auth, users, providers, requests)
- Responsibilities:
  - Implement business rules
  - Validate data integrity
  - Perform database queries via Prisma
  - Throw errors for invalid operations
  - Return clean data objects

**Example:**
```typescript
export async function createServiceRequest(clientId: string, data: CreateServiceRequestDto) {
  // Business rule: Only clients can create requests
  const user = await prisma.user.findUnique({ where: { id: clientId } });
  if (user?.role !== 'CLIENT') {
    throw new Error('Only clients can create requests');
  }
  
  // Create and return
  return await prisma.serviceRequest.create({ data: {...} });
}
```

### `/src/types`
TypeScript type definitions.

- DTOs (Data Transfer Objects)
- Request/response interfaces
- Shared types

**Purpose:** Type safety across the application.

### `/src/lib`
Utility libraries and shared code.

- `prisma.ts`: Prisma client singleton

### `/prisma`
Database schema and migrations.

- `schema.prisma`: Database models, relations, enums
- `seed.ts`: Initial data for development
- `/migrations`: Auto-generated migration files

## 🔐 Authentication Flow

```
1. User registers/logs in
   ↓
2. Server validates credentials
   ↓
3. Server generates JWT token
   ↓
4. Token sent to client
   ↓
5. Client stores token (localStorage/cookies)
   ↓
6. Client includes token in Authorization header
   ↓
7. Server verifies token on protected routes
   ↓
8. Server attaches user data to request
   ↓
9. Request proceeds to controller
```

**JWT Payload:**
```json
{
  "userId": "uuid",
  "role": "CLIENT",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 🛡️ Authorization (RBAC)

### Roles
- `CLIENT`: End users requesting services
- `PROVIDER`: Service providers

### Permission Check Flow
```
Request → authenticate → requireRole(['PROVIDER']) → Controller
```

### Permission Matrix

| Action | CLIENT | PROVIDER |
|--------|--------|----------|
| Create service request | ✅ | ❌ |
| View own requests | ✅ | ❌ |
| Cancel own request | ✅ | ❌ |
| Create provider profile | ❌ | ✅ |
| View available requests | ❌ | ✅ |
| Accept request | ❌ | ✅ |
| Update request status | ❌ | ✅ |
| Search providers | ✅ | ✅ |
| Manage own profile | ✅ | ✅ |

## 🔄 Service Request Workflow

### State Machine

```
PENDING ──────────────────────────────┐
  │                                   │
  │ (Provider accepts)                │ (Client cancels)
  ↓                                   ↓
ACCEPTED                           CANCELLED
  │
  │ (Provider starts work)
  ↓
IN_PROGRESS
  │
  │ (Provider completes)
  ↓
COMPLETED
```

### Valid Transitions

| From | To | Who |
|------|------|-----|
| PENDING | ACCEPTED | PROVIDER |
| PENDING | CANCELLED | CLIENT |
| ACCEPTED | IN_PROGRESS | PROVIDER |
| ACCEPTED | CANCELLED | CLIENT |
| IN_PROGRESS | COMPLETED | PROVIDER |

## 🗄️ Database Design

### Entity Relationships

```
User (1) ──────── (0..1) ProviderProfile
 │
 │ (1:N)
 │
ServiceRequest (N) ──── (0..1) ProviderProfile
```

### Key Design Decisions

**1. Soft Delete for Users**
- `isActive` boolean flag
- Preserves data integrity
- Allows request history retention

**2. Optional Provider for Requests**
- `providerId` nullable
- Allows PENDING requests without provider
- Set when request is accepted

**3. Separate Provider Profile**
- Not all users are providers
- Keeps User table clean
- Allows different validation rules

**4. Enums for Status/Urgency**
- Type-safe
- Enforced at database level
- Clear state definitions

## 🔌 Middleware Pipeline

### Request Flow Through Middleware

```
Request
  ↓
[1] CORS (allow frontend origin)
  ↓
[2] Body Parser (parse JSON)
  ↓
[3] Morgan (HTTP logging)
  ↓
[4] Route Match
  ↓
[5] authenticate (verify JWT)
  ↓
[6] requireRole (check permissions)
  ↓
[7] validate (check input)
  ↓
[8] handleValidationErrors
  ↓
[9] Controller
  ↓
Response
```

## 📊 Data Flow Example

**Creating a Service Request:**

```
1. CLIENT sends POST /api/requests
   {
     "title": "Fix plumbing",
     "description": "Leaking pipe",
     "location": "CDMX",
     "urgency": "HIGH"
   }

2. Route applies middleware:
   - authenticate (verify JWT, get userId)
   - requireRole(['CLIENT'])
   - validate input

3. Controller extracts data:
   - req.user.id (from auth middleware)
   - req.body (validated data)

4. Controller calls service:
   requestService.create(userId, data)

5. Service validates business rules:
   - Check user is CLIENT
   - Verify required fields

6. Service creates in database:
   prisma.serviceRequest.create({
     clientId: userId,
     status: 'PENDING',
     ...data
   })

7. Service returns created request

8. Controller sends response:
   res.status(201).json(request)

9. CLIENT receives:
   {
     "id": "uuid",
     "title": "Fix plumbing",
     "status": "PENDING",
     ...
   }
```

## 🚀 Performance Considerations

### Database Optimization
- Indexes on frequently queried fields (email, status)
- Prisma connection pooling
- Selective field loading (select specific fields)

### Caching Strategy (Future)
- Redis for session data
- Cache provider profiles
- Rate limiting per user

### Security
- Password hashing (bcrypt, 10 rounds)
- JWT expiration (7 days default)
- CORS restricted to frontend URL
- Input validation on all endpoints
- SQL injection prevention (Prisma parameterized queries)

## 📈 Scalability Path

### Phase 1 (Current)
- Single server
- PostgreSQL on Docker
- File-based configuration

### Phase 2 (Implementation)
- Authentication
- Full CRUD operations
- Business logic

### Future Phases
- Rate limiting
- File uploads (S3)
- Real-time notifications (WebSockets)
- Search optimization (Elasticsearch)
- Horizontal scaling (load balancer)
- Microservices architecture

## 🧪 Testing Strategy (Future)

```
Unit Tests
  ├── Services (business logic)
  └── Middleware (auth, validation)

Integration Tests
  ├── API endpoints
  └── Database operations

E2E Tests
  └── Complete user workflows
```

## 📝 Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "details": [...]  // Optional, for validation errors
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## 🔧 Development Tools

- **TypeScript**: Type safety
- **Nodemon**: Auto-restart on changes
- **Prisma Studio**: Visual database editor
- **Morgan**: HTTP request logging
- **Docker Compose**: Local database

## 📚 Best Practices

1. **Separation of Concerns**: Each layer has clear responsibilities
2. **DRY (Don't Repeat Yourself)**: Reusable middleware and services
3. **Type Safety**: Full TypeScript coverage
4. **Error Handling**: Consistent error responses
5. **Security First**: Authentication on all protected routes
6. **Documentation**: Code comments and API docs
7. **Environment Variables**: No hardcoded secrets
8. **Database Migrations**: Version-controlled schema changes

---

**Last Updated:** January 18, 2026  
**Status:** PHASE 1 Complete, PHASE 2 Ready
