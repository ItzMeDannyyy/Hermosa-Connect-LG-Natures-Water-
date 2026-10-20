# Tech Stack & Feature-Specific Tools

## Part 1: Core Technology Stack
The foundation of the **LG Nature's Water** platform uses a unified **TypeScript** ecosystem across mobile, web, and backend, backed by a relational and geospatial database.

| Layer | Technology | Purpose in the System |
| :--- | :--- | :--- |
| **Mobile App** (Customer & Rider) | **React Native (Expo)** + TypeScript | Unified mobile codebase with role-based views for **Customers** (1-click ordering, pickup scheduling, live rider tracking) and **Riders** (turn-by-turn routes, AI photo container counting, doorstep billing & printing). |
| **Web POS Dashboard** (Station Operator) | **React (Vite / Next.js)** + Tailwind CSS + shadcn/ui | Station counter web interface for managing walk-in/delivery orders, preset pricing, customer container balances, cost deductions, and 1-tap End-of-Day profit reports. |
| **Backend API & Real-Time Engine** | **NestJS** + Socket.io (`@nestjs/websockets`) | Modular backend handling business logic, role-based authentication (JWT), invoice-to-receipt state transitions (`#INV` → `#OR`), automated cron reminders, and real-time order dispatching. |
| **Database & ORM** | **PostgreSQL** + **Prisma ORM** (or TypeORM) | Relational database storing users, branches, orders, container accountability ledgers, and financial records with strict ACID transactions for POS accounting. |
| **State & Data Fetching** | **TanStack Query (React Query)** + **Zustand** | Manages server state caching, live order synchronization, and offline-resilient state on both React Web and React Native. |

---

## Part 2: Tools Mapped to the 7 Core Features

### Feature 1: Smart Routing to the Nearest Station
* **Nearest-Station Selection:**
  * **PostgreSQL + PostGIS Extension** (or **Turf.js / Haversine Formula** in NestJS): Compares the customer's GPS coordinates (`latitude`, `longitude`) against all registered LG Nature's Water station branches and automatically assigns the order to the closest station.
* **Stop Sequencing & Route Optimization:**
  * **Google Maps Routes / Directions API** (`optimizeWaypoints: true`) or **Mapbox Optimization API**: Automatically sequences multiple deliveries and empty container pickups on the same street into a single, fuel-efficient trip.
* **Turn-by-Turn Rider Navigation UI:**
  * **`react-native-maps`** + **`react-native-maps-directions`**: Renders the interactive map, numbered stop pins (`1, 2, 3...`), and route polylines inside the Rider's React Native app.
  * **`expo-location`**: Tracks real-time rider GPS coordinates so customers can see when their rider is arriving.

---

### Feature 2: Scheduling & Container Pickup
* **Date & Time Slot Picker UI:**
  * **`@react-native-community/datetimepicker`** + Custom Slot Selector: Allows customers to select their preferred date and time window (`8:00–10:00 AM`, `1:00–3:00 PM`, `4:00–6:00 PM`) and input the number of empty containers.
* **Automated Day-Before Reminders:**
  * **`@nestjs/schedule` (Cron Jobs)**: Runs scheduled background checks in NestJS to find all pickups booked for the next day and triggers reminders automatically.
* **Push & SMS Notifications:**
  * **Expo Push Notifications (`expo-notifications`) / Firebase Cloud Messaging (FCM)**: Sends instant in-app push reminders to both the customer and the station operator.
  * **Semaphore SMS API** (or **Twilio**): Sends automated SMS notifications for customers without active internet data.

---

### Feature 3: One-Click Ordering
* **Authentication & Saved Customer Profiles:**
  * **NestJS Passport (`@nestjs/passport` + JWT)** + **`expo-secure-store`**: Keeps customers logged in on their phones with saved delivery addresses, pinned map coordinates, and default branch assignments.
* **Instant Reorder Presets:**
  * **PostgreSQL Customer Preferences Table** + **Zustand**: Stores the customer's usual container type and quantity so reordering takes a single tap on the home screen.

---

### Feature 4: POS & Profit Tracking
* **POS Ledger & True Profit Engine:**
  * **NestJS Accounting Module + PostgreSQL Aggregations**: Automatically computes `Gross Sales - Operational Costs (Water + Electricity + Container Cost) = Net Profit` per transaction and per day.
* **Operator Analytics & End-of-Day Reports:**
  * **Recharts** or **Tremor** (React Web): Visualizes daily revenue, expense deductions, unpaid customer balances, and container turnover on the Operator Dashboard.
  * **`react-to-print` / `jspdf`**: Generates one-tap printable or downloadable End-of-Day closing summaries.

---

### Feature 5: Photo Container Count & Instant Billing (Gallon Detection)
* **Computer Vision / Object Detection Model:**
  * **Roboflow Hosted Inference API (`gallon-quality-detection`)**:
    * **Model Link:** [Roboflow Universe — Gallon Quality Detection](https://universe.roboflow.com/arya-tuvyn/gallon-quality-detection)
    * **How it works:** The React Native app captures a photo of the container load and sends it (either directly or via a NestJS proxy endpoint) to the Roboflow Inference API. Roboflow returns a JSON array of `predictions[]` containing each detected gallon's bounding box (`x, y, width, height`), confidence score, and total count.
* **Camera & Bounding-Box Overlay UI:**
  * **`expo-camera`** (or **`react-native-vision-camera`**): Captures the container load photo in the Rider/Operator app.
  * **`react-native-svg`**: Draws the numbered bounding boxes (`1, 2, 3... 8`) directly over the captured photo using the coordinates returned by the Roboflow model.
* **Instant POS Billing Calculation:**
  * **NestJS Billing Service**: Takes `predictions.length` (detected container count) from Roboflow, multiplies it by the stored preset price (`Count × Saved Price + Delivery Fee`), and posts the total directly into the POS.

---

### Feature 6: Automatic Invoicing vs. Official Receipt ("One Count, Two Documents")
* **Document State Machine:**
  * **Prisma + NestJS Order Workflow**: Stores a single `verified_container_count` and `photo_url` on the order record.
    * **Stage 1 (At Station / Pre-Dispatch):** Generates **Invoice (`#INV-XXXX`)** with status `AWAITING_DELIVERY` as soon as the Roboflow photo count completes.
    * **Stage 2 (At Customer Doorstep):** Converts that exact same record into **Official Receipt (`#OR-XXXX`)** upon delivery confirmation—preventing any count or price drift.
* **Cloud Image Storage:**
  * **Cloudinary** or **Supabase Storage**: Stores the pre-dispatch container count photo and doorstep proof-of-delivery photo linked to the invoice/receipt.

---

### Feature 7: Proof of Delivery & Smart Receipts
* **Portable Bluetooth Thermal Printing (On-the-Spot Receipts):**
  * **`react-native-thermal-receipt-printer`** (or **`react-native-ble-escpos-printer`**): Connects the Rider's smartphone via Bluetooth to a portable 58mm ESC/POS thermal printer to print physical receipts or unpaid charge slips at the customer's door.
* **Digital Receipt Generation & Sharing:**
  * **`expo-print` + `expo-sharing`**: Generates clean HTML-to-PDF/Image digital receipts formatted dynamically according to the 4 payment states:
    1. `PAID` (Cash settled at door)
    2. `E-PAYMENT` (GCash / Maya reference number attached)
    3. `PARTIAL` (Shows `Amount Paid` + `Balance Due`, carries balance to customer ledger)
    4. `UNPAID` (Formatted as a Charge Slip with a due date and flagged for the next delivery)
* **E-Payment Integration (GCash / Maya):**
  * **PayMongo API** (or **Reference Number + Receipt Screenshot Logging** for the Ideathon MVP): Verifies or logs GCash and Maya digital payments directly into the POS.
