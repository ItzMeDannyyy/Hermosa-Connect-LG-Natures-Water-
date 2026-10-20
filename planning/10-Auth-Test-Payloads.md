# Authentication & RBAC Test Payloads Guide

## Base Configuration
* **Base URL:** `http://localhost:3000/api/auth`
* **Default Headers:**
  * `Content-Type: application/json`
  * `Authorization: Bearer <accessToken>` *(for protected routes — or automatic via `HttpOnly` cookies in Postman/Browser)*

---

## Pre-Seeded Demo Accounts
These accounts are automatically seeded into PostgreSQL when the NestJS backend starts:

| Role | Full Name | Phone Number | Password | Assigned Branch |
| :--- | :--- | :--- | :--- | :--- |
| **`OPERATOR`** | Danny (Station Operator) | `+639170000001` | `password123` | LG Nature's Water - Station 1 (Main Hub) |
| **`RIDER`** | J. Cruz (Delivery Rider) | `+639170000002` | `password123` | LG Nature's Water - Station 1 (Main Hub) |
| **`CUSTOMER`** | Maria Santos (Household Customer) | `+639170000003` | `password123` | LG Nature's Water - Station 1 (Main Hub) |

---

## 1. Login (`POST /api/auth/login`)
**Access:** Public  
**Description:** Authenticates any user (`OPERATOR`, `RIDER`, or `CUSTOMER`) and returns an `accessToken` (15m), `refreshToken` (7d), and full role profile.

### Request Payload (Operator Login)
```json
{
  "phoneNumber": "+639170000001",
  "password": "password123"
}
```

### Request Payload (Rider Login — J. Cruz)
```json
{
  "phoneNumber": "+639170000002",
  "password": "password123"
}
```

### Request Payload (Customer Login — Maria Santos)
```json
{
  "phoneNumber": "+639170000003",
  "password": "password123"
}
```

---

## 2. Register a Customer + 1-Click Profile (`POST /api/auth/register/customer`)
**Access:** Public  
**Description:** Registers a new customer, calculates Haversine GPS distance against all station branches to **auto-assign the nearest LG Nature's Water branch**, and sets up their default container preset for 1-Click Ordering.

### Request Payload
```json
{
  "fullName": "Carlo Mendoza",
  "phoneNumber": "+639178889900",
  "password": "password123",
  "deliveryAddress": "18 Xavierville Ave, Loyola Heights, Quezon City",
  "latitude": 14.6401,
  "longitude": 121.0729,
  "defaultOrderQty": 8
}
```

### Expected Response (`201 Created`)
```json
{
  "message": "Customer registered and 1-Click Ordering profile configured",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "user": {
    "id": "uuid-here",
    "fullName": "Carlo Mendoza",
    "phoneNumber": "+639178889900",
    "role": "CUSTOMER",
    "branchId": "branch-uuid-here"
  },
  "customerProfile": {
    "defaultOrderQty": 8,
    "deliveryAddress": "18 Xavierville Ave, Loyola Heights, Quezon City",
    "latitude": 14.6401,
    "longitude": 121.0729,
    "emptyContainersHeld": 0,
    "runningUnpaidBalance": "0.00"
  },
  "nearestBranch": {
    "id": "branch-uuid-here",
    "name": "LG Nature's Water - Station 1 (Main Hub)",
    "address": "124 Katipunan Ave, Quezon City",
    "distanceKm": 0.26
  }
}
```

---

## 3. Provision a Staff Account (`POST /api/auth/register/staff`)
**Access:** Protected (`@Roles('OPERATOR')` only)  
**Headers:** `Authorization: Bearer <OPERATOR_ACCESS_TOKEN>`  
**Description:** Allows a Station Operator to create a new `RIDER` or `OPERATOR` account tied to their station branch.

### Request Payload
```json
{
  "fullName": "Rico Blanco (Delivery Rider)",
  "phoneNumber": "+639175554433",
  "password": "password123",
  "role": "RIDER"
}
```

---

## 4. Get Current Logged-In User (`GET /api/auth/me`)
**Access:** Protected (Any authenticated role)  
**Headers:** `Authorization: Bearer <ACCESS_TOKEN>`  
**Description:** Returns the logged-in user's details, assigned station branch, customer profile, and default container preset.

*(No JSON body required)*

---

## 5. Ideathon 1-Click Demo Role Switcher (`POST /api/auth/demo-switch`)
**Access:** Public (Ideathon Live Demo Helper)  
**Description:** Instantly issues tokens and profile data for the pre-seeded Demo `CUSTOMER`, `RIDER`, or `OPERATOR` without typing phone numbers or passwords.

### Request Payload (Switch to Rider)
```json
{
  "role": "RIDER"
}
```

### Request Payload (Switch to Customer)
```json
{
  "role": "CUSTOMER"
}
```

### Request Payload (Switch to Operator)
```json
{
  "role": "OPERATOR"
}
```

---

## 6. Refresh Access Token (`POST /api/auth/refresh`)
**Access:** Public (Requires valid `refreshToken` in body or `HttpOnly` cookie)  
**Description:** Verifies the refresh token against the Bcrypt hash stored in PostgreSQL and rotates both `accessToken` and `refreshToken`.

### Request Payload
```json
{
  "refreshToken": "<PASTE_REFRESH_TOKEN_HERE>"
}
```

---

## 7. Verify Role-Based Access Control (RBAC Guards)

### A. Operator-Only Route (`GET /api/auth/verify/operator-only`)
* **Headers:** `Authorization: Bearer <ACCESS_TOKEN>`
* **With `OPERATOR` token:** Returns `200 OK` (`"access": "GRANTED"`)
* **With `CUSTOMER` or `RIDER` token:** Returns `403 Forbidden` (`"Access denied. Required role(s): OPERATOR"`)

### B. Rider & Operator Route (`GET /api/auth/verify/rider-dispatch`)
* **Headers:** `Authorization: Bearer <ACCESS_TOKEN>`
* **With `RIDER` or `OPERATOR` token:** Returns `200 OK` (`"access": "GRANTED"`)
* **With `CUSTOMER` token:** Returns `403 Forbidden` (`"Access denied. Required role(s): RIDER, OPERATOR"`)

---

## 8. Logout & Revoke Session (`POST /api/auth/logout`)
**Access:** Protected (Any authenticated role)  
**Headers:** `Authorization: Bearer <ACCESS_TOKEN>`  
**Description:** Clears `refresh_token_hash` in PostgreSQL and clears `HttpOnly` cookies so the refresh token can no longer be used.

### Request Payload
```json
{}
```
