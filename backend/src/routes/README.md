# Routes

This directory will contain route definitions for the API.

## Structure (PHASE 2)

```
routes/
├── auth.routes.ts       # POST /api/auth/register, /api/auth/login
├── user.routes.ts       # GET/PUT/DELETE /api/users/me
├── provider.routes.ts   # Provider profile CRUD and search
└── request.routes.ts    # Service request CRUD and status updates
```

Each route file will:
1. Define endpoints and HTTP methods
2. Apply validation middleware
3. Apply authentication middleware
4. Call appropriate controller methods

## Example (to be implemented in PHASE 2)

```typescript
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { createRequest } from '../controllers/request.controller';
import { body } from 'express-validator';
import { validate, handleValidationErrors } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('CLIENT'),
  validate([
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('location').notEmpty(),
  ]),
  handleValidationErrors,
  createRequest
);

export default router;
```
