# ServiceFinder - Visual Workflows

## 🔐 User Registration & Login Flow

```
┌─────────────┐
│   CLIENT    │
│ (Frontend)  │
└──────┬──────┘
       │
       │ POST /api/auth/register
       │ { email, password, name, role }
       ▼
┌─────────────────────────────┐
│  Auth Routes                │
│  - Validate input           │
│  - Check email format       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Auth Controller            │
│  - Extract request data     │
│  - Call auth service        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Auth Service               │
│  - Check email uniqueness   │
│  - Hash password (bcrypt)   │
│  - Create user in DB        │
│  - Generate JWT token       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Prisma → PostgreSQL        │
│  INSERT INTO users          │
└──────┬──────────────────────┘
       │
       │ Return { user, token }
       ▼
┌─────────────┐
│   CLIENT    │
│ Store token │
└─────────────┘
```

---

## 🛡️ Protected Request Flow

```
┌─────────────┐
│   CLIENT    │
│ Has token   │
└──────┬──────┘
       │
       │ GET /api/users/me
       │ Authorization: Bearer <token>
       ▼
┌─────────────────────────────┐
│  Middleware: authenticate   │
│  1. Extract token           │
│  2. Verify JWT signature    │
│  3. Check expiration        │
│  4. Fetch user from DB      │
│  5. Attach req.user         │
└──────┬──────────────────────┘
       │
       │ req.user = { id, role }
       ▼
┌─────────────────────────────┐
│  Middleware: requireRole    │
│  - Check if role allowed    │
│  - 403 if not authorized    │
└──────┬──────────────────────┘
       │
       │ Authorized ✓
       ▼
┌─────────────────────────────┐
│  User Controller            │
│  - Call user service        │
│  - Return user profile      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────┐
│   CLIENT    │
│ { profile } │
└─────────────┘
```

---

## 📝 Service Request Creation (CLIENT)

```
┌─────────────┐
│   CLIENT    │
│ Logged in   │
│ Role: CLIENT│
└──────┬──────┘
       │
       │ POST /api/requests
       │ { title, description, location, urgency }
       │ Authorization: Bearer <token>
       ▼
┌─────────────────────────────┐
│  Middleware Stack           │
│  ✓ authenticate             │
│  ✓ requireRole('CLIENT')    │
│  ✓ validate input           │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Request Controller         │
│  - Extract req.user.id      │
│  - Extract req.body         │
│  - Call request service     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Request Service            │
│  - Verify user is CLIENT    │
│  - Create ServiceRequest    │
│  - status = PENDING         │
│  - providerId = null        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Prisma → PostgreSQL        │
│  INSERT INTO                │
│  service_requests           │
└──────┬──────────────────────┘
       │
       │ Return request object
       ▼
┌─────────────┐
│   CLIENT    │
│ { request } │
└─────────────┘
```

---

## 🔧 Service Request Acceptance (PROVIDER)

```
┌─────────────┐
│  PROVIDER   │
│ Logged in   │
│ Role: PROVIDER
└──────┬──────┘
       │
       │ 1. GET /api/requests/available
       │    → View PENDING requests
       ▼
┌─────────────────────────────┐
│  Request Service            │
│  - Query requests where     │
│    status = PENDING         │
│  - Return list              │
└──────┬──────────────────────┘
       │
       │ List of available requests
       ▼
┌─────────────┐
│  PROVIDER   │
│ Picks one   │
└──────┬──────┘
       │
       │ 2. POST /api/requests/:id/accept
       │    Authorization: Bearer <token>
       ▼
┌─────────────────────────────┐
│  Middleware Stack           │
│  ✓ authenticate             │
│  ✓ requireRole('PROVIDER')  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Request Controller         │
│  - Extract requestId        │
│  - Extract providerId       │
│  - Call acceptRequest()     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Request Service            │
│  - Verify status = PENDING  │
│  - Verify provider has      │
│    provider profile         │
│  - Update request:          │
│    * status = ACCEPTED      │
│    * providerId = <id>      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Prisma → PostgreSQL        │
│  UPDATE service_requests    │
│  SET status = ACCEPTED,     │
│      providerId = <id>      │
│  WHERE id = <requestId>     │
└──────┬──────────────────────┘
       │
       │ Request accepted ✓
       ▼
┌─────────────┐
│  PROVIDER   │
│ { request } │
└─────────────┘
```

---

## 🔄 Request Status Update Flow

```
State Machine:

PENDING ────┐
  │         │
  │         │ CLIENT cancels
  │         ▼
  │     CANCELLED
  │
  │ PROVIDER accepts
  ▼
ACCEPTED ───┐
  │         │
  │         │ CLIENT can still cancel
  │         ▼
  │     CANCELLED
  │
  │ PROVIDER starts work
  ▼
IN_PROGRESS
  │
  │ PROVIDER completes
  ▼
COMPLETED
```

**Update Flow:**

```
┌─────────────┐
│ USER        │
│ (CLIENT or  │
│  PROVIDER)  │
└──────┬──────┘
       │
       │ PATCH /api/requests/:id/status
       │ { status: "IN_PROGRESS" }
       ▼
┌─────────────────────────────┐
│  Request Controller         │
│  - Extract requestId        │
│  - Extract new status       │
│  - Extract userId & role    │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Request Service            │
│  - Fetch request from DB    │
│  - Verify ownership         │
│  - Validate transition:     │
│                             │
│  IF CLIENT:                 │
│    PENDING → CANCELLED ✓    │
│    ACCEPTED → CANCELLED ✓   │
│                             │
│  IF PROVIDER:               │
│    ACCEPTED → IN_PROGRESS ✓ │
│    IN_PROGRESS → COMPLETED ✓│
│                             │
│  - Update status            │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Prisma → PostgreSQL        │
│  UPDATE service_requests    │
│  SET status = <new_status>  │
└──────┬──────────────────────┘
       │
       │ Updated request
       ▼
┌─────────────┐
│ USER        │
│ { request } │
└─────────────┘
```

---

## 🔍 Provider Search Flow

```
┌─────────────┐
│   CLIENT    │
└──────┬──────┘
       │
       │ GET /api/providers/search
       │ ?serviceType=Plomería&location=CDMX&minRating=4
       ▼
┌─────────────────────────────┐
│  Provider Controller        │
│  - Extract query params     │
│  - Call search service      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Provider Service           │
│  - Build Prisma query:      │
│    * serviceType contains   │
│    * location contains      │
│    * rating >= minRating    │
│  - Execute query            │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Prisma → PostgreSQL        │
│  SELECT *                   │
│  FROM provider_profiles     │
│  WHERE serviceType LIKE %X% │
│    AND location LIKE %Y%    │
│    AND rating >= Z          │
└──────┬──────────────────────┘
       │
       │ List of providers
       ▼
┌─────────────┐
│   CLIENT    │
│ { providers }
└─────────────┘
```

---

## 📊 Database Relationships

```
┌─────────────────────────────┐
│          User               │
│  - id (PK)                  │
│  - email (unique)           │
│  - password (hashed)        │
│  - role (CLIENT|PROVIDER)   │
│  - isActive                 │
└─────┬───────────────┬───────┘
      │               │
      │ 1:1           │ 1:N
      │ (optional)    │
      ▼               ▼
┌──────────────┐   ┌──────────────────┐
│ Provider     │   │ ServiceRequest   │
│ Profile      │   │  - id (PK)       │
│              │   │  - clientId (FK) │
│  - id (PK)   │   │  - providerId(FK)│
│  - userId(FK)│   │  - status        │
│  - business  │   │  - urgency       │
│  - rating    │   └──────────────────┘
└──────┬───────┘            │
       │                    │
       │ 1:N                │
       │ (optional)         │
       └────────────────────┘
```

---

## 🎭 Role-Based Access Control (RBAC)

```
┌─────────────────────────────┐
│      Request arrives        │
└──────────┬──────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Has token?   │
    └──┬───────┬───┘
       │ No    │ Yes
       ▼       ▼
   ┌─────┐  ┌──────────────────┐
   │ 401 │  │ Verify & decode  │
   │     │  │ JWT token        │
   └─────┘  └──────┬───────────┘
                   │
                   ▼
            ┌──────────────┐
            │ Valid token? │
            └──┬───────┬───┘
               │ No    │ Yes
               ▼       ▼
           ┌─────┐  ┌──────────────────┐
           │ 401 │  │ Load user & role │
           └─────┘  └──────┬───────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Role check?  │
                    └──┬───────┬───┘
                       │ Fail  │ Pass
                       ▼       ▼
                   ┌─────┐  ┌──────────┐
                   │ 403 │  │ ALLOW    │
                   └─────┘  │ Proceed  │
                            └──────────┘
```

**Permission Examples:**

```
Endpoint: POST /api/requests
Required: authenticate + requireRole(['CLIENT'])

    CLIENT → ✅ ALLOWED
    PROVIDER → ❌ 403 Forbidden
    Anonymous → ❌ 401 Unauthorized

Endpoint: POST /api/requests/:id/accept
Required: authenticate + requireRole(['PROVIDER'])

    CLIENT → ❌ 403 Forbidden
    PROVIDER → ✅ ALLOWED
    Anonymous → ❌ 401 Unauthorized

Endpoint: GET /api/providers/search
Required: authenticate (any role)

    CLIENT → ✅ ALLOWED
    PROVIDER → ✅ ALLOWED
    Anonymous → ❌ 401 Unauthorized
```

---

## 🔐 Password Hashing Flow

```
Registration:

User password: "myPassword123"
       │
       ▼
bcrypt.hash(password, 10)
       │
       ▼
"$2a$10$N9qo8uL..." (60 chars)
       │
       ▼
Store in database


Login:

User enters: "myPassword123"
       │
       ▼
Fetch stored hash from DB
       │
       ▼
bcrypt.compare(entered, stored)
       │
       ├─ Match ✓ → Generate JWT
       └─ No match ✗ → 401 Invalid credentials
```

---

## 🎫 JWT Token Structure

```
┌─────────────────────────────┐
│         HEADER              │
│  {                          │
│    "alg": "HS256",          │
│    "typ": "JWT"             │
│  }                          │
└─────────────────────────────┘
              │
              ▼
┌─────────────────────────────┐
│         PAYLOAD             │
│  {                          │
│    "userId": "uuid",        │
│    "role": "CLIENT",        │
│    "iat": 1234567890,       │
│    "exp": 1234567890        │
│  }                          │
└─────────────────────────────┘
              │
              ▼
┌─────────────────────────────┐
│        SIGNATURE            │
│  HMACSHA256(                │
│    base64(header) + "." +   │
│    base64(payload),         │
│    JWT_SECRET               │
│  )                          │
└─────────────────────────────┘

Final token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiJ1dWlkIiwicm9sZSI6IkNMSUVOVCJ9.
4X3k2m9n5v8b7c1d2e3f4g5h6i7j8k9l0
```

---

**Last Updated:** January 18, 2026  
**Status:** PHASE 1 Documentation
