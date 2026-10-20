# NestJS API Endpoint & WebSocket Design

## Overview
This document defines the RESTful API endpoints and Socket.io events for the **LG Nature's Water** NestJS backend (`https://api.lgnatureswater.local/api/v1`). 

The API is organized into **6 modular NestJS controllers** mapped directly to the 7 core features and the entities in [07-Database-ERD.md](file:///C:/Users/ThinkPad/Desktop/Danny/LG-Natures%20Water/planning/07-Database-ERD.md).

---

## 1. Auth & Customer Profile Module (`/auth` & `/customers`)
Powers **Role-Based Access** (`CUSTOMER`, `RIDER`, `OPERATOR`), **One-Click Ordering Presets**, and **Container/Balance Accountability**.

| Method | Endpoint | Role | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/auth/login` | All | Authenticates user by phone/password and returns JWT + role (`CUSTOMER`, `RIDER`, `OPERATOR`). |
| `GET` | `/customers/:id/profile` | Customer / Operator | Returns saved delivery address, GPS (`lat/lng`), `default_preset_id`, `default_order_qty`, `empty_containers_held`, and `running_unpaid_balance`. |
| `PATCH` | `/customers/:id/preset` | Customer | Updates the customer's 1-click default container size and quantity. |
| `GET` | `/customers/:id/ledger` | Customer / Operator | Returns the customer's container accountability history (`CONTAINER_LEDGER`) and open unpaid/partial bills. |

---

## 2.Orders & One-Click Ordering Module (`/orders`)
Powers **One-Click Ordering (Feature 03)**, **Nearest-Station Auto-Selection (Feature 01)**, and **Container Pickup Scheduling (Feature 02)**.

| Method | Endpoint | Role | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/orders/one-click` | Customer | **1-Tap Reorder:** Uses the customer's saved `CUSTOMER_PROFILE` preset + GPS coordinates to auto-select the nearest `STATION_BRANCH`, price the order, and create a `PENDING` order. |
| `POST` | `/orders` | Customer / Operator | Creates a custom order with container quantity, pickup schedule (`scheduled_pickup_date`, `scheduled_time_slot`: `SLOT_8_10_AM`, `SLOT_1_3_PM`, `SLOT_4_6_PM`), and `empty_containers_to_pickup`. |
| `GET` | `/orders` | Operator / Rider | Lists orders filterable by `branch_id`, `status` (`PENDING`, `INVOICED`, `OUT_FOR_DELIVERY`, `DELIVERED`), and `date`. |
| `GET` | `/orders/:id` | All | Returns full order details including assigned station, Roboflow `PHOTO_COUNT_LOG`, and `BILLING_DOCUMENT` (`#INV` / `#OR`). |
| `POST` | `/orders/reminders/trigger` | Operator / Cron | Triggers the day-before scheduled pickup push/SMS notifications for tomorrow's booked slots (used by `@nestjs/schedule` and for live demo testing). |

### Sample Request & Response: `POST /orders` (Order + Pickup Schedule)
```json
// REQUEST
{
  "customerId": "c1a2b3c4-d5e6-7890-abcd-111111111111",
  "presetId": "p1a2b3c4-d5e6-7890-abcd-222222222222",
  "orderType": "BOTH",
  "requestedQty": 8,
  "emptyContainersToPickup": 3,
  "scheduledPickupDate": "2026-08-20",
  "scheduledTimeSlot": "SLOT_1_3_PM"
}

// RESPONSE (201 Created — Auto-routed & Auto-priced)
{
  "orderId": "o1a2b3c4-d5e6-7890-abcd-333333333333",
  "status": "PENDING",
  "assignedBranch": {
    "id": "b1-branch-uuid",
    "name": "LG Nature's Water — Branch 1 (Nearest: 0.8 km)"
  },
  "estimatedPricing": {
    "unitPrice": 25.00,
    "requestedQty": 8,
    "subtotal": 200.00,
    "deliveryFee": 30.00,
    "estimatedTotal": 230.00
  }
}
```

---

## 3. AI Photo Count & Auto-Invoicing Module (`/orders/:id/photo-count`)
Powers **Photo Container Count & Instant Billing (Feature 04)** and **Invoice on Count (`#INV`) Before Dispatch (Feature 06)**.

| Method | Endpoint | Role | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/orders/:id/photo-count` | Operator / Rider | Uploads the container load photo (`multipart/form-data` or base64), calls the **Roboflow `gallon-quality-detection` API**, stores bounding boxes (`1..N`), locks `verified_count`, and auto-generates **Invoice `#INV-XXXX`**. |

### Sample Response: `POST /orders/:id/photo-count`
```json
{
  "orderId": "o1a2b3c4-d5e6-7890-abcd-333333333333",
  "status": "INVOICED",
  "photoCountLog": {
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v1/load_1042.jpg",
    "detectedCount": 8,
    "capturedStage": "PRE_DISPATCH_STATION",
    "boundingBoxes": [
      { "boxNumber": 1, "x": 142, "y": 210, "width": 85, "height": 130, "confidence": 0.96 },
      { "boxNumber": 2, "x": 240, "y": 208, "width": 88, "height": 132, "confidence": 0.94 }
      // ... boxes 3 to 8
    ]
  },
  "invoice": {
    "invoiceNumber": "INV-1042",
    "documentStage": "INVOICE_ONLY",
    "verifiedCount": 8,
    "subtotalAmount": 200.00,
    "deliveryFee": 30.00,
    "totalDue": 230.00,
    "invoicedAt": "2026-08-20T09:42:00+08:00"
  }
}
```

---

## 4. Smart Routing & Dispatch Module (`/routes`)
Powers **Nearest-Station Logic & Sequenced Stop Navigation (Feature 01)**.

| Method | Endpoint | Role | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/routes/optimize` | Operator / System | Groups all `INVOICED` deliveries and scheduled container pickups for a branch, calls Google Maps / Mapbox Waypoint Optimization, and creates a `ROUTE_TRIP` with sequenced stops (`1, 2, 3...`). |
| `GET` | `/routes/rider/:riderId/active` | Rider | Returns the Rider's active `ROUTE_TRIP` with ordered stop pins, customer addresses, container pickup counts, and turn-by-turn polyline coordinates. |
| `PATCH` | `/routes/:tripId/dispatch` | Rider / Operator | Marks the trip as `IN_PROGRESS` and updates all grouped orders to `OUT_FOR_DELIVERY`. |

---

## 5. Doorstep Delivery & Smart Receipts Module (`/orders/:id/deliver`)
Powers **Proof of Delivery & 4-State Smart Receipts (Feature 05)** and **Invoice-to-Official-Receipt Conversion (`#INV` → `#OR`, Feature 06)**.

| Method | Endpoint | Role | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/orders/:id/deliver` | Rider | Confirms doorstep delivery using the existing `verified_count`, converts `#INV-1042` into Official Receipt **`#OR-1042`**, updates `CUSTOMER_PROFILE` container/balance ledgers, and formats the receipt for the chosen `payment_state`. |
| `GET` | `/orders/:id/receipt/print-payload` | Rider / Customer | Returns ESC/POS thermal printer commands (for Bluetooth 58mm printing) and structured JSON/HTML for digital SMS/in-app receipt sharing. |

### Sample Request & Response: `POST /orders/:id/deliver` (Partial Payment Example from Slide 11)
```json
// REQUEST
{
  "paymentState": "PARTIAL",
  "amountPaid": 130.00,
  "emptyContainersCollected": 3,
  "deliveryProofPhotoUrl": "https://res.cloudinary.com/demo/image/upload/v1/doorstep_1042.jpg"
}

// RESPONSE (200 OK — Converted from #INV-1042 to #OR-1042)
{
  "orderId": "o1a2b3c4-d5e6-7890-abcd-333333333333",
  "status": "DELIVERED",
  "officialReceipt": {
    "invoiceNumber": "INV-1042",
    "receiptNumber": "OR-1042",
    "documentStage": "OFFICIAL_RECEIPT",
    "paymentState": "PARTIAL",
    "verifiedCount": 8,
    "subtotalAmount": 200.00,
    "deliveryFee": 30.00,
    "totalDue": 230.00,
    "amountPaid": 130.00,
    "balanceDue": 100.00,
    "receiptBannerText": "PARTIALLY PAID — Balance Due PHP 100.00 carried to account",
    "receiptIssuedAt": "2026-08-20T11:15:00+08:00"
  },
  "customerAccountUpdate": {
    "newRunningUnpaidBalance": 100.00,
    "newEmptyContainersHeld": 5
  }
}
```

---

## 6. POS & Profit Tracking Module (`/pos`)
Powers **Station Operator Register, Cost Deduction, and 1-Tap End-of-Day Reports (Feature 03)**.

| Method | Endpoint | Role | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/pos/dashboard` | Operator | Returns live daily KPIs: Gross Revenue, Total Refill Costs (`water + electricity + container_wear`), **True Net Profit**, total containers refilled, and active unpaid customer balances. |
| `GET` | `/pos/end-of-day-report` | Operator | Generates the **1-Tap End-of-Day Report** summarizing all closed `#OR` sales, partial/unpaid charge slips, container inventory movement, and net profit for the shift. |
| `PATCH` | `/pos/presets/:id` | Operator | Updates preset container prices, delivery fee, or per-refill operational cost deductions. |

### Sample Response: `GET /pos/end-of-day-report?branchId=b1&date=2026-08-20`
```json
{
  "date": "2026-08-20",
  "branchName": "LG Nature's Water — Branch 1",
  "operationsSummary": {
    "totalOrdersCompleted": 42,
    "totalContainersRefilled": 310,
    "totalEmptyContainersCollected": 295
  },
  "financialSummary": {
    "grossRevenue": 9010.00,
    "cashCollected": 6450.00,
    "epaymentCollected": 1860.00,
    "unpaidReceivablesAdded": 700.00,
    "operationalCosts": {
      "waterCost": 930.00,
      "electricityCost": 930.00,
      "containerWearCost": 620.00,
      "totalCostOfRefill": 2480.00
    },
    "trueNetProfit": 6530.00
  }
}
```

---

## 7. Real-Time WebSocket Events (`Socket.io` Gateway)
Ensures the **Customer App**, **Rider App**, and **Operator Web POS** update instantly without refreshing the page.

| Event Name | Direction | Payload / Trigger |
| :--- | :--- | :--- |
| `order:created` | Server → Operator POS | Fired when a Customer taps **1-Click Order**, popping the order onto the station counter screen immediately. |
| `order:invoiced` | Server → Customer & POS | Fired when the Roboflow photo count generates `#INV-1042`, showing the customer the exact bill before the rider leaves. |
| `rider:location_update` | Rider → Server → Customer | Streams live Rider GPS coordinates (`lat, lng`) so the customer sees when their delivery is arriving. |
| `order:delivered` | Server → Operator POS & Customer | Fired when `#OR-1042` is issued at the door, updating the POS profit ticker and sending the digital receipt to the customer's app. |
