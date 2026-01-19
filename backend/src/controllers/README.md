# Controllers

This directory will contain controller functions that handle HTTP requests.

## Structure (PHASE 2)

```
controllers/
├── auth.controller.ts      # register, login
├── user.controller.ts      # getProfile, updateProfile, deleteAccount
├── provider.controller.ts  # createProfile, updateProfile, searchProviders
└── request.controller.ts   # createRequest, getRequests, acceptRequest, updateStatus
```

Controllers are responsible for:
1. Extracting data from requests (body, params, query)
2. Calling service layer methods
3. Sending appropriate HTTP responses
4. Error handling

## Example (to be implemented in PHASE 2)

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createServiceRequest } from '../services/request.service';

export async function createRequest(req: AuthRequest, res: Response) {
  try {
    const request = await createServiceRequest(req.user!.id, req.body);
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```
