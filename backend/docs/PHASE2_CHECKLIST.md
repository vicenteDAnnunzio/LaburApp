# PHASE 2 - Authentication & Service Requests Implementation

## ✅ Prerequisites (Completed in PHASE 1)
- [x] Database schema defined (Prisma)
- [x] Project structure created
- [x] Dependencies installed
- [x] RBAC configuration defined
- [x] API documentation created
- [x] Docker Compose for PostgreSQL

---

## 🎯 PHASE 2 Objectives

Implement full authentication system and service request functionality with proper authorization.

---

## 📋 Tasks Checklist

### 1️⃣ Setup & Database (PRIORITY: HIGH)

- [ ] Copy `.env.example` to `.env` and configure variables
  ```bash
  cp .env.example .env
  # Edit DATABASE_URL, JWT_SECRET
  ```

- [ ] Start PostgreSQL with Docker Compose
  ```bash
  docker-compose up -d
  ```

- [ ] Run Prisma migrations
  ```bash
  npm run prisma:generate
  npm run prisma:migrate
  ```

- [ ] Seed database with test data
  ```bash
  npm run prisma:seed
  ```

---

### 2️⃣ Authentication Service (PRIORITY: HIGH)

**File:** `src/services/auth.service.ts`

- [ ] Implement `hashPassword(password: string)` using bcrypt
- [ ] Implement `comparePassword(password: string, hash: string)`
- [ ] Implement `generateToken(userId: string, role: Role)` using JWT
- [ ] Implement `registerUser(data: RegisterDto)`
  - Validate email uniqueness
  - Hash password
  - Create user in database
  - Generate JWT token
  - Return user + token

- [ ] Implement `loginUser(data: LoginDto)`
  - Find user by email
  - Verify password
  - Check if user is active
  - Generate JWT token
  - Return user + token

---

### 3️⃣ Authentication Controller (PRIORITY: HIGH)

**File:** `src/controllers/auth.controller.ts`

- [ ] Implement `register` controller
  - Extract data from request body
  - Call `authService.registerUser()`
  - Return 201 with user + token
  - Handle errors (400 for validation, 409 for duplicate email)

- [ ] Implement `login` controller
  - Extract email/password from request body
  - Call `authService.loginUser()`
  - Return 200 with user + token
  - Handle errors (401 for invalid credentials)

---

### 4️⃣ Authentication Routes (PRIORITY: HIGH)

**File:** `src/routes/auth.routes.ts`

- [ ] Create Express router
- [ ] Define `POST /register` endpoint
  - Add validation for email, password, name, role
  - Call register controller
  
- [ ] Define `POST /login` endpoint
  - Add validation for email, password
  - Call login controller

- [ ] Export router

---

### 5️⃣ Authentication Middleware (PRIORITY: HIGH)

**File:** `src/middleware/auth.middleware.ts`

- [ ] Complete `authenticate` middleware implementation
  - Extract token from Authorization header
  - Verify JWT token
  - Fetch user from database
  - Attach user to `req.user`
  - Handle errors (401 for invalid/expired token)

- [ ] Test `requireRole` middleware works correctly

---

### 6️⃣ User Service (PRIORITY: MEDIUM)

**File:** `src/services/user.service.ts`

- [ ] Implement `getUserById(userId: string)`
- [ ] Implement `updateUser(userId: string, data: UpdateUserDto)`
- [ ] Implement `deleteUser(userId: string)`
  - Set isActive = false (soft delete)

---

### 7️⃣ User Controller (PRIORITY: MEDIUM)

**File:** `src/controllers/user.controller.ts`

- [ ] Implement `getProfile` - Get authenticated user's profile
- [ ] Implement `updateProfile` - Update authenticated user's profile
- [ ] Implement `deleteAccount` - Soft delete authenticated user

---

### 8️⃣ User Routes (PRIORITY: MEDIUM)

**File:** `src/routes/user.routes.ts`

- [ ] Define `GET /me` with authenticate middleware
- [ ] Define `PUT /me` with authenticate + validation
- [ ] Define `DELETE /me` with authenticate middleware

---

### 9️⃣ Provider Profile Service (PRIORITY: MEDIUM)

**File:** `src/services/provider.service.ts`

- [ ] Implement `createProviderProfile(userId: string, data: CreateProviderProfileDto)`
  - Verify user is PROVIDER role
  - Create provider profile
  
- [ ] Implement `getProviderProfileByUserId(userId: string)`

- [ ] Implement `updateProviderProfile(userId: string, data: UpdateProviderProfileDto)`

- [ ] Implement `searchProviders(query: SearchProvidersQuery)`
  - Filter by serviceType, location, minRating
  - Return providers with rating >= minRating

---

### 🔟 Provider Profile Controller (PRIORITY: MEDIUM)

**File:** `src/controllers/provider.controller.ts`

- [ ] Implement `createProfile`
- [ ] Implement `getOwnProfile`
- [ ] Implement `updateProfile`
- [ ] Implement `searchProviders`

---

### 1️⃣1️⃣ Provider Routes (PRIORITY: MEDIUM)

**File:** `src/routes/provider.routes.ts`

- [ ] `POST /profile` - Create profile (PROVIDER only)
- [ ] `GET /profile/me` - Get own profile (PROVIDER only)
- [ ] `PUT /profile/me` - Update profile (PROVIDER only)
- [ ] `GET /search` - Search providers (authenticated)

---

### 1️⃣2️⃣ Service Request Service (PRIORITY: HIGH)

**File:** `src/services/request.service.ts`

- [ ] Implement `createServiceRequest(clientId: string, data: CreateServiceRequestDto)`
  - Verify user is CLIENT
  - Create request with status = PENDING
  
- [ ] Implement `getRequestsByClient(clientId: string)`
  - Return all requests created by client
  
- [ ] Implement `getAvailableRequests()`
  - Return all PENDING requests
  
- [ ] Implement `getRequestsByProvider(providerId: string)`
  - Return requests where providerId matches
  
- [ ] Implement `acceptRequest(requestId: string, providerId: string)`
  - Verify request status is PENDING
  - Update status to ACCEPTED
  - Set providerId
  
- [ ] Implement `updateRequestStatus(requestId: string, userId: string, status: RequestStatus)`
  - Validate status transitions
  - CLIENT can only cancel (PENDING → CANCELLED)
  - PROVIDER can update (ACCEPTED → IN_PROGRESS → COMPLETED)
  
- [ ] Implement `getRequestById(requestId: string)`

---

### 1️⃣3️⃣ Service Request Controller (PRIORITY: HIGH)

**File:** `src/controllers/request.controller.ts`

- [ ] Implement `createRequest` (CLIENT only)
- [ ] Implement `getMyRequests` (CLIENT only)
- [ ] Implement `getAvailableRequests` (PROVIDER only)
- [ ] Implement `getMyAcceptedRequests` (PROVIDER only)
- [ ] Implement `acceptRequest` (PROVIDER only)
- [ ] Implement `updateRequestStatus` (CLIENT or PROVIDER)
- [ ] Implement `getRequestDetails` (CLIENT or PROVIDER with authorization)

---

### 1️⃣4️⃣ Service Request Routes (PRIORITY: HIGH)

**File:** `src/routes/request.routes.ts`

- [ ] `POST /` - Create request (CLIENT only)
- [ ] `GET /my-requests` - Get client's requests (CLIENT only)
- [ ] `GET /available` - Get pending requests (PROVIDER only)
- [ ] `GET /my-accepted` - Get provider's accepted requests (PROVIDER only)
- [ ] `POST /:requestId/accept` - Accept request (PROVIDER only)
- [ ] `PATCH /:requestId/status` - Update status (CLIENT or PROVIDER)
- [ ] `GET /:requestId` - Get request details (with authorization)

---

### 1️⃣5️⃣ Register Routes in App (PRIORITY: HIGH)

**File:** `src/app.ts`

- [ ] Uncomment route imports
- [ ] Register routes:
  - `app.use('/api/auth', authRoutes)`
  - `app.use('/api/users', userRoutes)`
  - `app.use('/api/providers', providerRoutes)`
  - `app.use('/api/requests', requestRoutes)`

---

### 1️⃣6️⃣ Testing & Validation (PRIORITY: HIGH)

- [ ] Test authentication flow
  - Register CLIENT
  - Register PROVIDER
  - Login as CLIENT
  - Login as PROVIDER
  
- [ ] Test RBAC permissions
  - CLIENT cannot create provider profile
  - PROVIDER cannot create service requests
  - Unauthenticated users cannot access protected routes
  
- [ ] Test service request workflow
  - CLIENT creates request
  - PROVIDER views available requests
  - PROVIDER accepts request
  - PROVIDER updates status to IN_PROGRESS
  - PROVIDER updates status to COMPLETED
  
- [ ] Test error cases
  - Invalid credentials
  - Duplicate email registration
  - Invalid JWT token
  - Insufficient permissions
  - Invalid status transitions

---

## 🚀 Implementation Order

1. **Auth Service** → Auth Controller → Auth Routes → Auth Middleware ✅
2. **User Service** → User Controller → User Routes ✅
3. **Request Service** → Request Controller → Request Routes ✅
4. **Provider Service** → Provider Controller → Provider Routes ✅
5. **Register all routes in app.ts** ✅
6. **Test everything** ✅

---

## 📝 Notes

- Follow the structure defined in PHASE 1
- Use TypeScript types from `src/types/index.ts`
- Reference `docs/api.md` for endpoint specifications
- Follow RBAC rules from `src/config/rbac.ts`
- All passwords must be hashed with bcrypt
- All protected routes require JWT authentication
- Validate all inputs with express-validator

---

## 🎓 Learning Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT Introduction](https://jwt.io/introduction)
- [Bcrypt Documentation](https://www.npmjs.com/package/bcryptjs)

---

## ✨ Success Criteria

PHASE 2 is complete when:
- ✅ Users can register and login
- ✅ JWT authentication works on all protected routes
- ✅ RBAC correctly restricts access based on roles
- ✅ Clients can create service requests
- ✅ Providers can view and accept requests
- ✅ Request status can be updated with proper authorization
- ✅ All endpoints from `docs/api.md` are implemented
- ✅ Error handling works correctly
- ✅ Database queries are optimized
