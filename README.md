# LG Nature's Water — Smart Water Delivery & Station POS System

**LG Nature's Water** is an all-in-one digital platform built to replace manual paper notebooks in water refilling stations. It connects **Customers**, **Delivery Riders**, and **Station Operators** through a Mobile App and a Web Point-of-Sale (POS) Dashboard.

> **Main Goal:** Replace slow paper logs and manual math with a single-tap workflow to **boost daily station and delivery performance by 40%**.

---

## Table of Contents

1. [Project Overview (The Problem & The Solution)](#1-project-overview-the-problem--the-solution)
2. [How the Process Changes (Before vs. After)](#2-how-the-process-changes-before-vs-after)
3. [Who Uses This System?](#3-who-uses-this-system)
4. [The 7 Core Features](#4-the-7-core-features)
5. [Tech Stack & Tools Used](#5-tech-stack--tools-used)
6. [System Architecture & Database Overview](#6-system-architecture--database-overview)
7. [Security & Account Protection](#7-security--account-protection)
8. [Repository Folder Structure](#8-repository-folder-structure)
9. [How to Run the Project Locally](#9-how-to-run-the-project-locally)
10. [Planning & Documentation Files](#10-planning--documentation-files)

---

## 1. Project Overview (The Problem & The Solution)

### The Problem: Why Water Stations Lose Time and Money
Right now, most water refilling stations run on **paper notebooks, handheld calculators, and memory**. Every single order, delivery, and empty container return is written down by hand. This causes three major problems:

1. **Slow Manual Order Taking (Repetitive Writing)**
   * Staff write down the exact same customer name, address, and container order on paper every time someone calls or walks in.
   * Writing everything by hand slows down the counter and limits how many orders the station can finish in a day.
2. **Unplanned Delivery Trips (Guesswork on the Road)**
   * Delivery riders leave the station without a planned map route or a clear stop list.
   * Riders waste time and fuel driving back and forth on the same street or showing up at houses with locked gates.
3. **Lost Empty Containers & Math Mistakes (Memory & Calculator Errors)**
   * Empty water jugs left with customers are tracked from memory or buried in old notebook pages, leading to lost containers.
   * Bills, change, unpaid balances, and daily sales totals are added up by hand—causing pricing mistakes, missing money, and long hours copying totals at closing time.

### The Solution: One App for Every Step
**LG Nature's Water** turns everything written in a paper notebook into **one tap**. By connecting a **Customer & Rider Mobile App** with a **Station Counter Web POS**, the system automates ordering, station routing, AI container counting, billing, and daily profit reports:

* **Faster Orders:** Saved customer profiles and preset prices mean zero handwriting and zero manual math.
* **More Deliveries per Shift:** Orders go straight to the nearest station branch, and stops on the same street are grouped into one clean map route.
* **Zero Missing Containers or Unpaid Bills:** Every container dropped off, picked up, or left unpaid is tracked automatically per customer.

---

## 2. How the Process Changes (Before vs. After)

We reduce a slow **5-step paper process** down to a **3-step digital process**:

| Step | Before: Paper Notebook (5 Steps) | Now: LG Nature's Water App (3 Steps) |
| :---: | :--- | :--- |
| **1** | **Customer calls or walks in:** Staff writes down the customer's name, address, and order on paper. | **Customer taps to order & schedule pickup:** Saved addresses and usual container counts handle the order in one tap. |
| **2** | **Write order in the notebook:** Staff logs the transaction details by hand. | **Auto-priced by the POS:** The system automatically calculates container prices, delivery fees, and account balances. |
| **3** | **Calculate bill by hand:** Staff figures out the total mentally or on a basic calculator. | **Auto-routed to the nearest station:** The order goes to the closest branch and is added to the rider's turn-by-turn map route. |
| **4** | **Rider guesses the route:** Delivery team drives out without planned stop order or scheduled pickup times. | *(Removed — handled automatically in Step 3)* |
| **5** | **Recopy sales at closing:** Staff rewrites and adds up all paper orders at night to close the books. | *(Removed — the Web POS creates a 1-Tap End-of-Day Report instantly)* |

---

## 3. Who Uses This System?

The platform is built for **three types of users** working together in real time:

1. **Customers (Households & Offices) — *Mobile App***
   * Reorder water refills in one tap using saved addresses and usual container quantities.
   * Pick a convenient day and time window for empty container pickup.
   * See the exact bill before the rider arrives and get clear digital or printed receipts.
2. **Delivery Teams (Riders) — *Mobile App***
   * Follow a numbered, turn-by-turn map route that combines deliveries and empty pickups on the same street.
   * Take **one photo** of a container load so AI counts the gallons and creates the bill automatically.
   * Confirm delivery at the door and print or send a smart receipt based on how the customer paid.
3. **Water Refilling Operators (Station Counter) — *Web POS Dashboard***
   * Manage walk-in and delivery orders without calculators or paper logs.
   * Check which customers still hold empty containers or have unpaid balances.
   * Track **True Net Profit** (sales minus water, electricity, and container wear costs) and generate End-of-Day reports in one click.

---

## 4. The 7 Core Features

### Feature 1: Smart Routing to the Nearest Station
Saves fuel and road time so riders can finish more deliveries in every shift.
* **Nearest-Station Assignment:** When a customer places an order, the system checks their GPS location and sends the order to the closest LG Nature's Water branch automatically.
* **Turn-by-Turn Rider Map:** Riders open one map screen showing numbered stops (`Stop 1 → Stop 2 → Stop 3`) in the best driving order.
* **Combined Street Stops:** Water deliveries and empty container pickups on the same street are grouped into a single trip.

### Feature 2: Scheduling & Container Pickup
Turns empty container collection into planned stops instead of wasted trips to locked gates.
* **Customer Time Slots:** Customers pick the exact date and time window that works for them (`8:00–10:00 AM`, `1:00–3:00 PM`, or `4:00–6:00 PM`) and enter how many empty containers are ready.
* **Container Tracking (Ledger):** The system tracks how many empty containers each customer currently has and when they need to be returned.
* **Day-Before Reminders:** Both the customer and the station operator get an automatic reminder the day before a scheduled pickup.

### Feature 3: One-Click Ordering
Removes the need to type or write customer details over and over.
* **Saved Customer Profiles:** Stores the customer's delivery address, map pin, contact number, and nearest station branch.
* **Preset Container Sizes:** Customers and operators can reorder their usual container type (such as 5-Gallon Slim or Round) and quantity with a single tap.

### Feature 4: POS & Profit Tracking
Replaces the paper notebook and calculator with a live digital cash register that shows real profit.
* **Preset Pricing:** Refill prices and delivery fees are saved once—staff never have to calculate totals by hand.
* **Exact Change & Unpaid Balance Tracking:** Automatically calculates exact change for cash payments and records any unpaid balance on the customer's account.
* **True Net Profit Calculation:** Automatically subtracts station costs (**water cost + electricity cost + container wear cost**) from total sales so the owner sees **real net profit**, not just gross sales.
* **1-Tap End-of-Day Report:** Creates the full daily closing summary in one click—no more recopying notebook pages at night.

### Feature 5: Photo Container Count & Instant Billing (AI Gallon Detection)
Replaces slow manual counting of large container loads with a single phone photo.
* **1-Snap Photo Capture:** The operator or rider points the phone camera at the water containers and takes one picture.
* **AI Container Detection:** Computer vision detects every container in the photo (even stacked rows), draws numbered boxes (`1, 2, 3...`) around them, and counts the total.
* **Instant POS Bill:** Multiplies the AI container count by the saved price plus delivery fee (`Detected Count × Refill Price + Delivery Fee`) and sends the bill straight to the POS.
  * *Example:* `8 containers refilled (PHP 200.00) + Delivery fee (PHP 30.00) = Total Due PHP 230.00`.

### Feature 6: Automatic Invoicing vs. Official Receipt ("One Count, Two Documents")
Uses the single AI photo count to create both the pre-delivery bill and the final receipt without re-typing any numbers.
* **Before Leaving the Station (`#INV` Invoice):** As soon as the photo count is taken at the station, the app creates an **Invoice** (for example, `INVOICE #INV-1042 — Status: Awaiting Delivery`). The customer can see the exact bill before the rider even leaves.
* **At the Customer's Doorstep (`#OR` Official Receipt):** When the rider arrives and confirms delivery, that exact same record turns into an **Official Receipt** (`OFFICIAL RECEIPT #OR-1042`).
* **No Math Errors or Changes:** Because both documents use the exact same photo count, numbers never change between the station and the door.

### Feature 7: Proof of Delivery & Smart Receipts
Combines the delivery photo and verified container count into an instant receipt—printed on the spot using a **portable Bluetooth thermal printer** or sent to the customer's phone—that adjusts automatically to **4 payment types**:

| Payment Type | How the Smart Receipt Works |
| :--- | :--- |
| **1. PAID (Cash)** | Customer pays full cash at the door. The receipt prints on the spot and the sale closes in the POS. |
| **2. E-PAYMENT** | Rider records the GCash or Maya reference number, and a digital receipt is sent to the customer. |
| **3. PARTIAL** | Receipt clearly shows both **Amount Paid** and **Balance Due** (e.g., *Paid PHP 130.00 / Balance Due PHP 100.00*). The remaining balance is added to the customer's account automatically. |
| **4. UNPAID** | Prints as a formal **Charge Slip** with a payment due date and flags the balance for the customer's next delivery. |

---

## 5. Tech Stack & Tools Used

### Part A: Core Technology Stack

| Layer | Technology Used | What It Does |
| :--- | :--- | :--- |
| **Mobile App** (Customer & Rider) | **React Native (Expo)** + TypeScript + `lucide-react-native` | Single mobile app supporting both **Customers** (1-click ordering, pickup scheduling, live tracking) and **Riders** (turn-by-turn routes, AI photo container counter, doorstep receipts). |
| **Web POS Dashboard** (Station Operator) | **React (Vite)** + TypeScript + **Tailwind CSS** + `lucide-react` | Counter web app for managing walk-in/delivery orders, customer container ledgers, unpaid balances, expense deductions, and 1-tap End-of-Day profit reports. |
| **Backend API & Real-Time Server** | **NestJS** + TypeScript + **Passport JWT** | Handles business rules, user login & role permissions, invoice-to-receipt conversion (`#INV` → `#OR`), scheduled pickup reminders, and POS calculations. |
| **Database & ORM** | **PostgreSQL** + **Drizzle ORM** (`drizzle-kit`) | Stores users, station branches, orders, AI photo count logs, billing documents, and container accountability records safely. |
| **Code Quality & Testing** | **Oxlint**, **Prettier**, **Vitest** | Keeps TypeScript code clean, formatted, and tested across the project. |

---

### Part B: Specific Tools Used for Each of the 7 Core Features

1. **Smart Routing to the Nearest Station (Feature 1)**
   * **PostgreSQL + Haversine / PostGIS Distance Logic:** Compares the customer's GPS coordinates (`latitude`, `longitude`) with all LG Nature's Water branches to pick the closest station.
   * **Google Maps Directions / Mapbox Optimization API:** Orders multiple deliveries and container pickups on the same street into the fastest route.
   * **`react-native-maps` & `expo-location`:** Displays the interactive route map and tracks live rider location.

2. **Scheduling & Container Pickup (Feature 2)**
   * **Date & Time Slot Picker UI:** Lets customers choose their pickup date and time slot (`8:00–10:00 AM`, `1:00–3:00 PM`, `4:00–6:00 PM`).
   * **Automated Reminders (`@nestjs/schedule` + `expo-notifications` / SMS):** Checks tomorrow's scheduled pickups and sends day-before notifications to customers and operators.

3. **One-Click Ordering (Feature 3)**
   * **JWT Authentication + Saved Customer Profiles:** Keeps customers signed in on their phones and remembers their address, nearest station, and default container preset so reordering takes one tap.

4. **POS & Profit Tracking (Feature 4)**
   * **NestJS POS & Accounting Service:** Automatically calculates `Gross Revenue - (Water Cost + Electricity Cost + Container Wear Cost) = True Net Profit`.
   * **Web POS Print & Export:** Formats daily sales, unpaid balances, and container movement into a printable 1-Tap End-of-Day summary.

5. **Photo Container Count & Instant Billing (Feature 5)**
   * **Roboflow Computer Vision API (`gallon-quality-detection`):**
     * Model: [Roboflow Universe — Gallon Quality Detection](https://universe.roboflow.com/arya-tuvyn/gallon-quality-detection)
     * Detects water containers in a photo and returns the exact coordinates (`x, y, width, height`) and total count.
   * **Camera & SVG Box Overlay (`react-native-svg`):** Draws numbered boxes (`1, 2, 3...`) directly over the photo on the phone screen and calculates the bill right away.

6. **Automatic Invoicing vs. Official Receipt (Feature 6)**
   * **Order & Billing State Machine:** Locks the AI-verified container count into `BILLING_DOCUMENT` as `#INV-XXXX` before dispatch and converts that exact same record into `#OR-XXXX` upon delivery.
   * **Cloud Photo Storage:** Saves the pre-dispatch container photo and doorstep delivery photo with the billing record.

7. **Proof of Delivery & Smart Receipts (Feature 7)**
   * **Bluetooth Thermal Printer Support (58mm ESC/POS):** Prints physical receipts or unpaid charge slips right at the customer's door.
   * **Digital Receipt Generator:** Creates shareable digital receipts formatted for `PAID (Cash)`, `E-PAYMENT (GCash/Maya)`, `PARTIAL`, or `UNPAID (Charge Slip)`.

---

## 6. System Architecture & Database Overview

The PostgreSQL database (managed with **Drizzle ORM** inside [`backend/src/database/schema/`](file:///C:/Users/ThinkPad/Desktop/Danny/LG-Natures%20Water/backend/src/database/schema)) is organized into 9 core tables that connect all three apps:

| Database Table | What It Stores |
| :--- | :--- |
| **`station_branches`** | Branch name, address, GPS coordinates (`latitude`, `longitude`), and default delivery fee. |
| **`container_presets`** | Container types (e.g., *5-Gallon Slim / Round*), refill price, and per-refill costs (`water_cost`, `electricity_cost`, `container_wear_cost`). |
| **`users`** | Login accounts for `CUSTOMER`, `RIDER`, and `OPERATOR` roles. |
| **`customer_profiles`** | Customer delivery address, GPS pin, 1-click default preset and quantity, `empty_containers_held`, `running_unpaid_balance`, and pickup reminder status. |
| **`route_trips`** | Planned rider trips containing the ordered list of delivery and pickup stops for the day. |
| **`orders`** | Every order from `PENDING` → `INVOICED` → `OUT_FOR_DELIVERY` → `DELIVERED`, including scheduled pickup slots and verified container counts. |
| **`photo_count_logs`** | Photo URL, AI-detected container count, and bounding-box coordinates from the Roboflow gallon detection model. |
| **`billing_documents`** | Handles **"One Count, Two Documents"** (`#INV` to `#OR`), payment status (`PAID_CASH`, `E_PAYMENT`, `PARTIAL`, `UNPAID_CHARGE_SLIP`), operational costs, and net profit. |
| **`container_ledgers`** | Step-by-step history of every container delivered to or picked up from each customer. |

---

## 7. Security & Account Protection

Because the system manages money, customer credit balances, and home addresses, several built-in protections are included in the backend:

* **Role-Based Access Control (RBAC):**
  * **Customers** can only view and place orders for their own account.
  * **Riders** can only view routes assigned to them and confirm doorstep deliveries.
  * **Operators** have exclusive access to station pricing presets, operational costs, true net profit, and End-of-Day reports.
* **Server-Side Bill Calculation:** The mobile and web apps never calculate final prices on their own. The backend calculates all bills, change, and unpaid balances so numbers cannot be tampered with.
* **Encrypted Passwords & Safe Tokens:** Passwords and refresh tokens are hashed with `bcryptjs`, and login sessions use short-lived JWT access tokens (`15m`) paired with refresh tokens (`HttpOnly` cookies on Web).
* **Rate Limiting & Input Checks:** Protected by `@nestjs/throttler`, `helmet`, and `class-validator` to block spam logins and invalid data.

---

## 8. Repository Folder Structure

```text
LG-Natures Water/
├── backend/                  # NestJS Backend API + Drizzle ORM (PostgreSQL)
│   ├── src/
│   │   ├── auth/             # Login, registration, JWT guards & role permissions
│   │   ├── database/         # Drizzle ORM PostgreSQL schema & relations
│   │   ├── device/           # Device management module
│   │   └── pos/              # POS dashboard, billing & profit tracking endpoints
│   ├── drizzle.config.ts     # Drizzle Kit database configuration
│   └── package.json
│
├── web-pos/                  # Station Operator Web POS Dashboard (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # POS UI views, modals, profit widgets & ledgers
│   │   ├── services/         # API client services connecting to NestJS
│   │   ├── types/            # Shared TypeScript interfaces
│   │   └── App.tsx           # Main Operator POS Dashboard
│   └── package.json
│
├── mobile/                   # Customer & Rider Mobile App (React Native + Expo Router)
│   ├── src/                  # Mobile screens for 1-Click Order, AI Photo Count & Rider Route
│   ├── assets/               # App icons and images
│   └── package.json
│
└── planning/                 # Full project documentation, wireframes, ERD & pitch deck
    ├── 01-Executive-Summary-and-Core-Challenge.md
    ├── 02-Process-Transformation.md
    ├── 03-Target-Users.md
    ├── 04-Seven-Core-Features.md
    ├── 05-Tech-Stack-and-Tools.md
    ├── 06-MVP-Ideathon-Roadmap.md
    ├── 07-Database-ERD.md
    ├── 08-API-Endpoint-Design.md
    ├── 09-Authentication-and-Security-Plan.md
    ├── 10-Auth-Test-Payloads.md
    ├── 11-Application-and-Web-UI-Wireframes.md
    └── LG-Natures-Water-App-Pitch.pptx
```

---

## 9. How to Run the Project Locally

### Prerequisites
Make sure you have the following installed on your computer:
* **Node.js** (v20 or newer recommended)
* **PostgreSQL** (local instance or cloud PostgreSQL database URL)
* **Expo Go** app on your phone (or an Android / iOS emulator) for testing the mobile app

---

### Step 1: Set Up and Run the Backend (`backend/`)

1. Open a terminal and go to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the packages:
   ```bash
   npm install
   ```
3. Create your `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your PostgreSQL `DATABASE_URL` and JWT secrets.
4. Push the database schema to PostgreSQL using Drizzle:
   ```bash
   npm run db:push
   ```
5. Start the NestJS server in development mode:
   ```bash
   npm run start:dev
   ```
   The backend API will run at `http://localhost:3000`.

---

### Step 2: Set Up and Run the Operator Web POS (`web-pos/`)

1. Open a new terminal and go to the `web-pos` folder:
   ```bash
   cd web-pos
   ```
2. Install the packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open the shown local URL (usually `http://localhost:5173`) in your browser to use the Station Operator Web POS Dashboard.

---

### Step 3: Set Up and Run the Mobile App (`mobile/`)

1. Open a new terminal and go to the `mobile` folder:
   ```bash
   cd mobile
   ```
2. Install the packages:
   ```bash
   npm install
   ```
3. Start the Expo server:
   ```bash
   npx expo start
   ```
   Scan the QR code using **Expo Go** on your phone, or press `a` for Android emulator / `w` for web preview.

---

## 10. Planning & Documentation Files

Want to dive deeper into how the system is designed? Check out the [`planning/`](file:///C:/Users/ThinkPad/Desktop/Danny/LG-Natures%20Water/planning) folder:

* **[01 — Executive Summary & Core Challenge](planning/01-Executive-Summary-and-Core-Challenge.md):** Detailed breakdown of the paper notebook problem and the 40% performance goal.
* **[02 — Process Transformation](planning/02-Process-Transformation.md):** Step-by-step comparison of the old 5-step manual process vs. the new 3-step digital flow.
* **[03 — Target Users](planning/03-Target-Users.md):** Needs and pain points of Operators, Riders, and Customers.
* **[04 — The 7 Core Features](planning/04-Seven-Core-Features.md):** Full guide to all seven features in the platform.
* **[05 — Tech Stack & Tools](planning/05-Tech-Stack-and-Tools.md):** Complete list of libraries, APIs, and AI models mapped to each feature.
* **[06 — MVP Ideathon Roadmap](planning/06-MVP-Ideathon-Roadmap.md):** 5-phase build plan and live pitch demo flow.
* **[07 — Database ERD](planning/07-Database-ERD.md):** Visual Entity-Relationship Diagram and table descriptions.
* **[08 — API Endpoint Design](planning/08-API-Endpoint-Design.md):** REST API routes, request/response examples, and real-time WebSocket events.
* **[09 — Authentication & Security Plan](planning/09-Authentication-and-Security-Plan.md):** Login flows, JWT token setup, and role permissions.
* **[11 — Application & Web UI Wireframes](planning/11-Application-and-Web-UI-Wireframes.md):** Screen layouts for the Customer App, Rider App, and Operator Web POS.
