# Services

This directory will contain business logic and database operations.

## Structure (PHASE 2)

```
services/
├── auth.service.ts      # registerUser, loginUser, hashPassword, comparePassword, generateToken
├── user.service.ts      # getUserById, updateUser, deleteUser
├── provider.service.ts  # createProviderProfile, updateProviderProfile, searchProviders
└── request.service.ts   # createServiceRequest, getRequests, acceptRequest, updateRequestStatus
```

Services are responsible for:
1. Business logic implementation
2. Data validation
3. Database queries using Prisma
4. Data transformation
5. Throwing errors for invalid operations

## Example (to be implemented in PHASE 2)

```typescript
import prisma from '../lib/prisma';
import { CreateServiceRequestDto } from '../types';

export async function createServiceRequest(
  clientId: string,
  data: CreateServiceRequestDto
) {
  // Verify user is a CLIENT
  const user = await prisma.user.findUnique({ where: { id: clientId } });
  if (user?.role !== 'CLIENT') {
    throw new Error('Only clients can create service requests');
  }

  // Create request
  return await prisma.serviceRequest.create({
    data: {
      clientId,
      title: data.title,
      description: data.description,
      location: data.location,
      urgency: data.urgency,
      budget: data.budget,
      scheduledAt: data.scheduledAt,
    },
  });
}
```
