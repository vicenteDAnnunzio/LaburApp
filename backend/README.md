# ServiceFinder Backend API

Backend API for ServiceFinder - A platform to connect clients with service providers.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/          # Configuration files (env, rbac)
│   ├── controllers/     # Request handlers (PHASE 2)
│   ├── middleware/      # Express middleware (auth, validation)
│   ├── routes/          # API route definitions (PHASE 2)
│   ├── services/        # Business logic (PHASE 2)
│   ├── types/           # TypeScript type definitions
│   ├── lib/             # Utility libraries (Prisma client)
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seed data
├── docs/
│   ├── api.md           # API documentation
│   └── PHASE2_CHECKLIST.md  # Implementation checklist
├── docker-compose.yml   # PostgreSQL container
├── .env.example         # Environment variables template
├── package.json
└── tsconfig.json
```

## 🚀 Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **Dev Tools:** nodemon, ts-node

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for PostgreSQL)
- Git

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env and configure:
# - DATABASE_URL
# - JWT_SECRET (use a strong random string)
# - PORT (default: 4000)
# - FRONTEND_URL
```

### 3. Start PostgreSQL Database

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker-compose ps
```

### 4. Setup Prisma

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (create database tables)
npm run prisma:migrate

# (Optional) Seed database with test data
npm run prisma:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:4000`

Check health endpoint: `http://localhost:4000/health`

## 📚 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Build
npm run build            # Compile TypeScript to JavaScript
npm start                # Run production build

# Prisma
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:seed      # Seed database with test data
```

## 🗄️ Database Schema

### User
- `id` (UUID)
- `email` (unique)
- `password` (hashed)
- `name`
- `phone`
- `role` (CLIENT | PROVIDER)
- `isActive`
- Timestamps

### ProviderProfile
- `id` (UUID)
- `userId` (1-to-1 with User)
- `businessName`
- `serviceType`
- `description`
- `location`
- `availability`
- `rating`
- `reviewCount`
- `isVerified`
- Timestamps

### ServiceRequest
- `id` (UUID)
- `clientId` (FK to User)
- `providerId` (FK to ProviderProfile, nullable)
- `title`
- `description`
- `location`
- `urgency` (LOW | MEDIUM | HIGH)
- `status` (PENDING | ACCEPTED | IN_PROGRESS | COMPLETED | CANCELLED)
- `budget`
- `scheduledAt`
- Timestamps

## 🔐 Authentication & Authorization

### Roles
- **CLIENT:** Can create service requests
- **PROVIDER:** Can view and accept service requests

### Permissions (RBAC)

**CLIENT can:**
- Create, read, update, and cancel own service requests
- Search for providers
- Manage own profile

**PROVIDER can:**
- Create and manage provider profile
- View available (pending) requests
- Accept service requests
- Update status of accepted requests
- Manage own profile

See [src/config/rbac.ts](src/config/rbac.ts) for detailed permission definitions.

## 📖 API Documentation

Complete API documentation available at: [docs/api.md](docs/api.md)

### Key Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

**Users:**
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `DELETE /api/users/me` - Delete account

**Provider Profiles:**
- `POST /api/providers/profile` - Create provider profile
- `GET /api/providers/profile/me` - Get own profile
- `PUT /api/providers/profile/me` - Update profile
- `GET /api/providers/search` - Search providers

**Service Requests:**
- `POST /api/requests` - Create request (CLIENT)
- `GET /api/requests/my-requests` - Get own requests (CLIENT)
- `GET /api/requests/available` - Get available requests (PROVIDER)
- `GET /api/requests/my-accepted` - Get accepted requests (PROVIDER)
- `POST /api/requests/:id/accept` - Accept request (PROVIDER)
- `PATCH /api/requests/:id/status` - Update status
- `GET /api/requests/:id` - Get request details

## 🔄 Development Workflow

### PHASE 1 (✅ COMPLETED)
- Database schema definition
- Project structure
- Configuration files
- API documentation
- RBAC setup

### PHASE 2 (🚧 TO BE IMPLEMENTED)
- Authentication implementation (register, login, JWT)
- User CRUD operations
- Provider profile management
- Service request CRUD and workflow
- Authorization middleware
- Input validation

See [docs/PHASE2_CHECKLIST.md](docs/PHASE2_CHECKLIST.md) for detailed implementation tasks.

## 🧪 Testing

After implementing PHASE 2, test with:

1. **Register users:**
   ```bash
   curl -X POST http://localhost:4000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"client@test.com","password":"test123","name":"Test Client","role":"CLIENT"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"client@test.com","password":"test123"}'
   ```

3. **Access protected route:**
   ```bash
   curl http://localhost:4000/api/users/me \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## 🐳 Docker Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f

# Remove volumes (⚠️ deletes all data)
docker-compose down -v
```

## 🗂️ Database Management

### Prisma Studio
Visual database browser:
```bash
npm run prisma:studio
```
Opens at `http://localhost:5555`

### Reset Database
```bash
# Warning: This will delete all data!
npx prisma migrate reset

# Then seed again
npm run prisma:seed
```

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 📁 Project Status

**PHASE 1:** ✅ COMPLETED
- All foundational files created
- Database schema defined
- Project structure established
- Documentation written

**PHASE 2:** 🚧 READY TO START
- See [docs/PHASE2_CHECKLIST.md](docs/PHASE2_CHECKLIST.md) for tasks
- Implementation order defined
- All types and interfaces prepared

## 🤝 Contributing

This is a structured project following a phased approach:
1. Follow the architecture defined in PHASE 1
2. Implement features according to PHASE 2 checklist
3. Maintain clean code and proper TypeScript types
4. Follow RESTful API conventions

## 📝 Notes

- Passwords are hashed using bcrypt (10 salt rounds)
- Soft delete implemented for users (isActive flag)
- All timestamps managed by Prisma
- JWT tokens expire based on JWT_EXPIRES_IN env variable
- CORS configured for frontend URL

## 🆘 Troubleshooting

**Database connection failed:**
- Check if PostgreSQL container is running: `docker-compose ps`
- Verify DATABASE_URL in `.env`
- Check PostgreSQL logs: `docker-compose logs postgres`

**Prisma errors:**
- Regenerate client: `npm run prisma:generate`
- Reset database: `npx prisma migrate reset`

**Port already in use:**
- Change PORT in `.env`
- Or kill process using port 4000

## 📄 License

MIT
