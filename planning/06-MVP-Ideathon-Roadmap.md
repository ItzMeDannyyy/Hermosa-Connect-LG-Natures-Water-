# MVP Ideathon Roadmap: LG Nature's Water

## Overview
In an ideathon/hackathon setting, judges care most about **seeing the complete "One Tap" loop work live** and witnessing the **AI Photo Container Count + Smart Receipt** in action. 

This roadmap divides the implementation into **5 focused phases**, prioritizing a seamless end-to-end demo across all 3 user roles (**Customer → Station Operator → Rider**) while cutting non-essential boilerplate.

---

## The "Golden Demo Flow" Checklist (What Judges Will See)
Before building, align every task around this 2-minute live pitch demonstration:
- [ ] **Step 1 — Customer (Mobile):** Taps **1-Click Order** (8 containers) + selects a **Pickup Schedule** (`1:00–3:00 PM`, 3 empty containers).
- [ ] **Step 2 — System (Auto-Routing & POS):** Automatically assigns the nearest LG Nature's Water branch and prices the order on the **Operator Web POS**.
- [ ] **Step 3 — Station / Rider (AI Photo Count → `#INV`):** Snaps a photo of the containers using the **Roboflow Gallon Detection model**. Bounding boxes (`1..8`) appear on screen, generating **Invoice `#INV-1042`** (`PHP 230.00`) before dispatch.
- [ ] **Step 4 — Rider (Smart Route):** Opens the **Turn-by-Turn Map** with sequenced delivery + pickup stops on the same street.
- [ ] **Step 5 — Rider (Doorstep Delivery → `#OR`):** Arrives at the customer's door, confirms the count, selects a payment state (`PAID`, `E-PAYMENT`, `PARTIAL`, or `UNPAID`), and generates/prints **Official Receipt `#OR-1042`**.
- [ ] **Step 6 — Operator (POS & Profit):** The Web Dashboard updates live—showing gross revenue, deducted costs (water/electricity/container), **True Net Profit**, updated customer container balance, and a **1-Tap End-of-Day Report**.

---

## Phase 1: Foundation, Database & Core Backend (NestJS + PostgreSQL)
**Goal:** Stand up the database schema, seed realistic station/customer data, and expose the core REST + WebSocket APIs.

- [ ] **Initialize Monorepo / Repositories**
  - [ ] Create `backend/` (NestJS + Prisma + Socket.io)
  - [ ] Create `web-pos/` (React + Vite + Tailwind CSS + shadcn/ui)
  - [ ] Create `mobile/` (React Native Expo with quick Role Switcher: *Customer View* vs. *Rider View*)
- [ ] **Prisma Schema & Database Setup (PostgreSQL)**
  - [ ] Create `User` model (Roles: `CUSTOMER`, `RIDER`, `OPERATOR`, saved address, GPS `lat/lng`, unpaid balance, empty containers held)
  - [ ] Create `StationBranch` model (Name, GPS `lat/lng`, preset container prices, per-refill operational costs)
  - [ ] Create `Order` model (Status: `PENDING` → `INVOICED` → `OUT_FOR_DELIVERY` → `DELIVERED`, `pickupSlot`, `emptyContainersToReturn`, `detectedCount`, `invoiceNumber`, `receiptNumber`, `paymentState`, `amountPaid`, `balanceDue`, `photoUrl`)
- [ ] **Seed Script (`prisma db seed`)**
  - [ ] Pre-load 3 LG Nature's Water branches with real GPS coordinates
  - [ ] Pre-load 5 sample customers on the same street
  - [ ] Configure preset container pricing (`PHP 25/refill`, `PHP 30 delivery fee`) and cost breakdown (`PHP 8/refill` for water + electricity + wear)

---

## Phase 2: AI Photo Container Count & "One Count, Two Documents" (Features 04 & 06)
**Goal:** Build the standout technical feature first so it is rock-solid for the demo.

- [ ] **Roboflow Integration (`gallon-quality-detection`)**
  - [ ] Create NestJS endpoint `POST /orders/:id/photo-count` (or direct mobile call) sending captured image to `https://universe.roboflow.com/arya-tuvyn/gallon-quality-detection`
  - [ ] Parse `predictions[]` to extract bounding box coordinates (`x, y, width, height`) and total container count
- [ ] **Camera + Bounding Box UI (React Native)**
  - [ ] Integrate `expo-camera` / `expo-image-picker` to snap a photo of water containers
  - [ ] Overlay numbered bounding boxes (`1, 2, ... N`) on the image using `react-native-svg` (matching Slide 10 of the pitch deck)
- [ ] **Auto-Generate Invoice (`#INV`)**
  - [ ] Automatically compute `Detected Count × Preset Price + Delivery Fee`
  - [ ] Transition the order status to `INVOICED` (`#INV-1042`) before the rider leaves the station

---

## Phase 3: Customer Experience — 1-Click Order & Pickup Scheduling (Features 02 & 03)
**Goal:** Make ordering and container pickup booking effortless in the React Native Customer view.

- [ ] **1-Click Order Screen**
  - [ ] Display customer's saved profile and current empty containers on hand
  - [ ] Build 1-tap **"Reorder Usual"** button alongside preset container size selectors
- [ ] **Pickup Slot Scheduler**
  - [ ] Build interactive day selector (`MON 12`, `TUE 13`, `WED 14`)
  - [ ] Build time slot pills (`8:00–10:00 AM`, `1:00–3:00 PM`, `4:00–6:00 PM`) + counter for empty containers to be picked up
- [ ] **Nearest-Station Auto-Assignment (Feature 01 Backend)**
  - [ ] Calculate Haversine/PostGIS distance from customer to all 3 branches on order confirmation
  - [ ] Auto-assign order to the closest station branch
- [ ] **Day-Before Reminder Trigger**
  - [ ] Add a "Trigger Demo Reminder" button (backed by `@nestjs/schedule` + `expo-notifications`) to demonstrate the automated day-before pickup notification live on stage

---

## Phase 4: Rider App — Smart Routing & Smart Receipts (Features 01, 05 & 06)
**Goal:** Equip the delivery rider with sequenced navigation and 1-tap doorstep confirmation.

- [ ] **Sequenced Route & Map Screen (`react-native-maps`)**
  - [ ] Plot the assigned station and all active customer deliveries + scheduled container pickups on the map
  - [ ] Sequence stops automatically along the street (`Stop 1 → Stop 2 → Stop 3`) and display estimated fuel/time saved
- [ ] **Doorstep Confirmation & 4-State Smart Receipt (`#OR`)**
  - [ ] Build **Confirm Delivery** action on `#INV-1042` that converts it into **`#OR-1042`** without re-encoding the count
  - [ ] Implement **PAID (Cash)** state: computes exact change and closes the sale
  - [ ] Implement **E-PAYMENT** state: input field for GCash/Maya Reference No.
  - [ ] Implement **PARTIAL** state: input `Amount Paid` (e.g., `PHP 130.00`), auto-compute `Balance Due` (`PHP 100.00`), and add to customer's account ledger
  - [ ] Implement **UNPAID** state: generate a Charge Slip with a due date and flag the customer for the next delivery
- [ ] **Receipt Output**
  - [ ] Render styled thermal receipt preview in-app (`expo-print` / shareable image)
  - [ ] *(Optional)* Connect Bluetooth 58mm thermal printer trigger if hardware is brought to the pitch

---

## Phase 5: Operator Web POS & Profit Tracking Dashboard (Feature 03)
**Goal:** Give the station counter a real-time command center that proves the **+40% performance case**.

- [ ] **Live Order & Container Accountability Table**
  - [ ] Connect real-time Socket.io feed showing incoming orders and assigned nearest branch
  - [ ] Display live `#INV` vs. `#OR` status, unpaid customer balances, and empty containers out per customer
- [ ] **True Profit Calculator Widget**
  - [ ] Display **Gross Revenue** card (e.g., `PHP 230.00` per order)
  - [ ] Display **Cost of Refill Deducted** card (Water + Electricity + Container wear)
  - [ ] Display **True Net Profit** card
- [ ] **1-Tap End-of-Day Report Modal**
  - [ ] Build 1-click daily closing summary generator that replaces manual notebook re-copying

---

## Ideathon Time-Saving Tips (Hackathon Strategy)
- [ ] **Single Mobile App with a Role Toggle:** Build **one Expo app** with a quick top-bar toggle (`[Customer View | Rider View]`) so live pitching is seamless.
- [ ] **Fallback Cache for Roboflow Wi-Fi Issues:** Include a fallback pre-cached bounding-box response in case the venue Wi-Fi times out during the live demo.
- [ ] **Pre-Seeded Street Coordinates:** Seed 4–5 customer addresses along a real local street near the venue so `react-native-maps` renders a clean, tight delivery route.
