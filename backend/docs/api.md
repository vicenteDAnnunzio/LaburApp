# ServiceFinder API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📋 Table of Contents
1. [Authentication](#authentication-endpoints)
2. [Users](#user-endpoints)
3. [Provider Profiles](#provider-profile-endpoints)
4. [Service Requests](#service-request-endpoints)

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account (CLIENT or PROVIDER).

**Auth Required:** ❌ No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "CLIENT"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CLIENT",
    "createdAt": "2026-01-18T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login
**POST** `/auth/login`

Authenticate and receive a JWT token.

**Auth Required:** ❌ No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CLIENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## User Endpoints

### Get Current User Profile
**GET** `/users/me`

Get the authenticated user's profile.

**Auth Required:** ✅ Yes (CLIENT or PROVIDER)

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "CLIENT",
  "isActive": true,
  "createdAt": "2026-01-18T10:00:00.000Z",
  "updatedAt": "2026-01-18T10:00:00.000Z"
}
```

---

### Update Profile
**PUT** `/users/me`

Update the authenticated user's profile.

**Auth Required:** ✅ Yes (CLIENT or PROVIDER)

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+0987654321"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Updated",
  "phone": "+0987654321",
  "role": "CLIENT",
  "updatedAt": "2026-01-18T11:00:00.000Z"
}
```

---

### Delete Account
**DELETE** `/users/me`

Delete the authenticated user's account.

**Auth Required:** ✅ Yes (CLIENT or PROVIDER)

**Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

---

## Provider Profile Endpoints

### Create Provider Profile
**POST** `/providers/profile`

Create a provider profile (only for PROVIDER role).

**Auth Required:** ✅ Yes (PROVIDER only)

**Request Body:**
```json
{
  "businessName": "García Plumbing Services",
  "serviceType": "Plomería",
  "description": "Servicios profesionales de plomería",
  "location": "Ciudad de México",
  "availability": "Lun-Vie 8:00-18:00"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "businessName": "García Plumbing Services",
  "serviceType": "Plomería",
  "description": "Servicios profesionales de plomería",
  "location": "Ciudad de México",
  "availability": "Lun-Vie 8:00-18:00",
  "rating": 0,
  "reviewCount": 0,
  "isVerified": false,
  "createdAt": "2026-01-18T10:00:00.000Z"
}
```

---

### Get Own Provider Profile
**GET** `/providers/profile/me`

Get the authenticated provider's profile.

**Auth Required:** ✅ Yes (PROVIDER only)

**Response (200):**
```json
{
  "id": "uuid",
  "businessName": "García Plumbing Services",
  "serviceType": "Plomería",
  "location": "Ciudad de México",
  "rating": 4.8,
  "reviewCount": 24,
  "isVerified": true
}
```

---

### Update Provider Profile
**PUT** `/providers/profile/me`

Update the authenticated provider's profile.

**Auth Required:** ✅ Yes (PROVIDER only)

**Request Body:**
```json
{
  "description": "Updated description",
  "availability": "24/7"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "businessName": "García Plumbing Services",
  "description": "Updated description",
  "availability": "24/7",
  "updatedAt": "2026-01-18T11:00:00.000Z"
}
```

---

### Search Providers
**GET** `/providers/search?serviceType=Plomería&location=CDMX`

Search for providers by service type and location.

**Auth Required:** ✅ Yes (CLIENT or PROVIDER)

**Query Parameters:**
- `serviceType` (optional): Filter by service type
- `location` (optional): Filter by location
- `minRating` (optional): Minimum rating (0-5)

**Response (200):**
```json
{
  "providers": [
    {
      "id": "uuid",
      "businessName": "García Plumbing",
      "serviceType": "Plomería",
      "location": "CDMX",
      "rating": 4.8,
      "reviewCount": 24,
      "isVerified": true
    }
  ],
  "total": 1
}
```

---

## Service Request Endpoints

### Create Service Request
**POST** `/requests`

Create a new service request (CLIENT only).

**Auth Required:** ✅ Yes (CLIENT only)

**Request Body:**
```json
{
  "title": "Fuga de agua en cocina",
  "description": "Necesito reparar una fuga urgente",
  "location": "Colonia Roma, CDMX",
  "urgency": "HIGH",
  "budget": 1500,
  "scheduledAt": "2026-01-20T09:00:00.000Z"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Fuga de agua en cocina",
  "description": "Necesito reparar una fuga urgente",
  "location": "Colonia Roma, CDMX",
  "urgency": "HIGH",
  "status": "PENDING",
  "budget": 1500,
  "scheduledAt": "2026-01-20T09:00:00.000Z",
  "createdAt": "2026-01-18T10:00:00.000Z"
}
```

---

### Get My Requests (CLIENT)
**GET** `/requests/my-requests`

Get all service requests created by the authenticated client.

**Auth Required:** ✅ Yes (CLIENT only)

**Response (200):**
```json
{
  "requests": [
    {
      "id": "uuid",
      "title": "Fuga de agua en cocina",
      "status": "PENDING",
      "urgency": "HIGH",
      "createdAt": "2026-01-18T10:00:00.000Z",
      "provider": null
    }
  ],
  "total": 1
}
```

---

### Get Available Requests (PROVIDER)
**GET** `/requests/available`

Get all pending requests that providers can accept.

**Auth Required:** ✅ Yes (PROVIDER only)

**Response (200):**
```json
{
  "requests": [
    {
      "id": "uuid",
      "title": "Fuga de agua en cocina",
      "description": "Necesito reparar una fuga urgente",
      "location": "Colonia Roma, CDMX",
      "urgency": "HIGH",
      "budget": 1500,
      "client": {
        "name": "John Doe",
        "phone": "+1234567890"
      }
    }
  ],
  "total": 1
}
```

---

### Get My Accepted Requests (PROVIDER)
**GET** `/requests/my-accepted`

Get all requests accepted by the authenticated provider.

**Auth Required:** ✅ Yes (PROVIDER only)

**Response (200):**
```json
{
  "requests": [
    {
      "id": "uuid",
      "title": "Fuga de agua en cocina",
      "status": "IN_PROGRESS",
      "scheduledAt": "2026-01-20T09:00:00.000Z",
      "client": {
        "name": "John Doe",
        "phone": "+1234567890"
      }
    }
  ]
}
```

---

### Accept Request (PROVIDER)
**POST** `/requests/:requestId/accept`

Accept a pending service request.

**Auth Required:** ✅ Yes (PROVIDER only)

**Response (200):**
```json
{
  "id": "uuid",
  "status": "ACCEPTED",
  "providerId": "uuid",
  "updatedAt": "2026-01-18T11:00:00.000Z"
}
```

---

### Update Request Status
**PATCH** `/requests/:requestId/status`

Update the status of a service request.

**Auth Required:** ✅ Yes
- CLIENT: Can cancel own requests
- PROVIDER: Can update status of accepted requests

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Valid status transitions:**
- CLIENT: `PENDING` → `CANCELLED`
- PROVIDER: `ACCEPTED` → `IN_PROGRESS` → `COMPLETED`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "IN_PROGRESS",
  "updatedAt": "2026-01-18T12:00:00.000Z"
}
```

---

### Get Request Details
**GET** `/requests/:requestId`

Get details of a specific request.

**Auth Required:** ✅ Yes
- CLIENT: Can view own requests
- PROVIDER: Can view accepted requests or available (PENDING) requests

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Fuga de agua en cocina",
  "description": "Necesito reparar una fuga urgente",
  "location": "Colonia Roma, CDMX",
  "urgency": "HIGH",
  "status": "IN_PROGRESS",
  "budget": 1500,
  "scheduledAt": "2026-01-20T09:00:00.000Z",
  "client": {
    "name": "John Doe",
    "phone": "+1234567890"
  },
  "provider": {
    "businessName": "García Plumbing",
    "rating": 4.8
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Status Codes Summary

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
