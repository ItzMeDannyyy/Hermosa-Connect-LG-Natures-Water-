# Database Schema & Entity-Relationship Diagram (ERD)

## Overview
This Entity-Relationship Diagram (ERD) is designed for **PostgreSQL + Prisma ORM** and powers all 7 core features of the **LG Nature's Water** application:
1. **Nearest-Station & Sequenced Routing** (`STATION_BRANCH`, `CUSTOMER_PROFILE`, `ROUTE_TRIP`, `ORDER`)
2. **One-Click Ordering** (`CUSTOMER_PROFILE` + `CONTAINER_PRESET`)
3. **Scheduling & Container Pickup** (`ORDER.scheduled_time_slot` + `CONTAINER_LEDGER`)
4. **POS & True Profit Tracking** (`CONTAINER_PRESET` operational costs + `BILLING_DOCUMENT.net_profit`)
5. **AI Photo Container Count** (`PHOTO_COUNT_LOG` storing Roboflow `gallon-quality-detection` bounding boxes)
6. **Automatic Invoicing vs. Official Receipt** (`BILLING_DOCUMENT` transitioning from `#INV` to `#OR`)
7. **Proof of Delivery & 4-State Smart Receipts** (`BILLING_DOCUMENT.payment_state`: `PAID_CASH`, `E_PAYMENT`, `PARTIAL`, `UNPAID_CHARGE_SLIP`)

---

## Visual Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    STATION_BRANCH ||--o{ USER : "employs (Operators & Riders)"
    STATION_BRANCH ||--o{ CONTAINER_PRESET : "defines pricing & costs"
    STATION_BRANCH ||--o{ ORDER : "fulfills (Nearest Station)"
    STATION_BRANCH ||--o{ ROUTE_TRIP : "dispatches"

    USER ||--o| CUSTOMER_PROFILE : "has (if role = CUSTOMER)"
    USER ||--o{ ORDER : "places (as Customer)"
    USER ||--o{ ROUTE_TRIP : "assigned to (as Rider)"

    CONTAINER_PRESET ||--o{ CUSTOMER_PROFILE : "saved as default preset"
    CONTAINER_PRESET ||--o{ ORDER : "used for pricing"

    ROUTE_TRIP ||--o{ ORDER : "sequences stops (1..N)"

    ORDER ||--o| PHOTO_COUNT_LOG : "verified by (Roboflow AI)"
    ORDER ||--o| BILLING_DOCUMENT : "generates (#INV -> #OR)"
    ORDER ||--o{ CONTAINER_LEDGER : "updates accountability"

    STATION_BRANCH {
        uuid id PK
        string name "e.g., LG Nature's Water - Branch 1"
        string address
        float latitude "For PostGIS/Haversine nearest-station"
        float longitude
        decimal delivery_fee "Default: PHP 30.00"
        timestamp created_at
    }

    CONTAINER_PRESET {
        uuid id PK
        uuid branch_id FK
        string name "e.g., 5-Gallon Slim / Round"
        decimal refill_price "e.g., PHP 25.00"
        decimal water_cost "e.g., PHP 3.00"
        decimal electricity_cost "e.g., PHP 3.00"
        decimal container_wear_cost "e.g., PHP 2.00"
    }

    USER {
        uuid id PK
        uuid branch_id FK "Nullable for Customers"
        enum role "CUSTOMER | RIDER | OPERATOR"
        string full_name
        string phone_number
        string password_hash
        timestamp created_at
    }

    CUSTOMER_PROFILE {
        uuid id PK
        uuid user_id FK
        uuid default_preset_id FK "For 1-Click Ordering"
        int default_order_qty "e.g., 8 containers"
        string delivery_address
        float latitude "Used to route to nearest station"
        float longitude
        int empty_containers_held "Accountability: containers currently out"
        decimal running_unpaid_balance "Carried balance from PARTIAL/UNPAID"
        date containers_due_back_date
        boolean pickup_reminder_sent "Ledger state: Reminded (green check) vs Remind"
        timestamp last_reminded_at "Timestamp of latest Remind / Remind Again action"
    }

    ROUTE_TRIP {
        uuid id PK
        uuid branch_id FK
        uuid rider_id FK
        enum status "PLANNED | IN_PROGRESS | COMPLETED"
        date trip_date
        jsonb optimized_waypoints "Google Maps sequenced stop polyline/order"
    }

    ORDER {
        uuid id PK
        uuid customer_id FK
        uuid branch_id FK "Auto-assigned nearest station"
        uuid trip_id FK "Nullable until grouped into Rider route"
        uuid preset_id FK
        enum order_type "REFILL_DELIVERY | CONTAINER_PICKUP | BOTH"
        enum status "PENDING | INVOICED | OUT_FOR_DELIVERY | DELIVERED | CANCELLED"
        int requested_qty "Initial customer request"
        int verified_count "Locked in from Roboflow AI Photo Count"
        int empty_containers_to_pickup "Customer-scheduled return count"
        date scheduled_pickup_date "e.g., MON 12"
        enum scheduled_time_slot "SLOT_8_10_AM | SLOT_1_3_PM | SLOT_4_6_PM"
        int stop_sequence_number "1, 2, 3... on the Rider's route"
        boolean reminder_sent "Day-before cron notification flag"
        timestamp created_at
    }

    PHOTO_COUNT_LOG {
        uuid id PK
        uuid order_id FK
        string image_url "Cloudinary/Supabase image path"
        int detected_count "e.g., 8 containers detected"
        jsonb bounding_boxes "Roboflow predictions[] (x, y, width, height, confidence)"
        enum captured_stage "PRE_DISPATCH_STATION | DOORSTEP_DELIVERY"
        timestamp captured_at
    }

    BILLING_DOCUMENT {
        uuid id PK
        uuid order_id FK
        string invoice_number "e.g., #INV-1042 (Issued before dispatch)"
        string receipt_number "e.g., #OR-1042 (Issued on delivery)"
        enum document_stage "INVOICE_ONLY | OFFICIAL_RECEIPT"
        enum payment_state "PAID_CASH | E_PAYMENT | PARTIAL | UNPAID_CHARGE_SLIP"
        decimal subtotal_amount "verified_count * refill_price"
        decimal delivery_fee "PHP 30.00"
        decimal total_due "e.g., PHP 230.00"
        decimal amount_paid "e.g., PHP 130.00 (if PARTIAL)"
        decimal change_given "Computed exact change for Cash"
        decimal balance_due "e.g., PHP 100.00 (carried to CUSTOMER_PROFILE)"
        decimal total_operational_cost "verified_count * (water + elec + wear)"
        decimal net_profit "total_due - total_operational_cost"
        string epayment_provider "GCASH | MAYA (nullable)"
        string epayment_ref_no "Reference number attached"
        date charge_slip_due_date "If UNPAID"
        timestamp invoiced_at "e.g., 9:42 AM"
        timestamp receipt_issued_at "e.g., 11:15 AM"
    }

    CONTAINER_LEDGER {
        uuid id PK
        uuid customer_id FK
        uuid order_id FK
        int containers_delivered "Adds to customer's held count"
        int containers_picked_up "Subtracts from customer's held count"
        int running_balance_after "Snapshot of empty containers out"
        timestamp logged_at
    }
```

---

## Table Breakdown & Feature Mapping

| Table | Primary Responsibility |
| :--- | :--- |
| **`STATION_BRANCH`** | Stores branch coordinates (`latitude`, `longitude`) for nearest-station auto-selection and default delivery fees. |
| **`CONTAINER_PRESET`** | Stores preset container refill prices (`PHP 25.00`) alongside per-unit operational costs (`water_cost`, `electricity_cost`, `container_wear_cost`) so the POS calculates **True Net Profit** automatically. |
| **`USER`** | Unified authentication table supporting `CUSTOMER`, `RIDER`, and `OPERATOR` roles. |
| **`CUSTOMER_PROFILE`** | Stores customer GPS coordinates, saved 1-click reorder preferences (`default_preset_id`, `default_order_qty`), `empty_containers_held`, `running_unpaid_balance`, and Jug & Balance Ledger reminder state (`pickup_reminder_sent`, `last_reminded_at`) for the `Remind` → `Reminded` (green check) and `Remind Again` (`⋯` menu) workflow. |
| **`ROUTE_TRIP`** | Groups deliveries and scheduled container pickups on the same street into a single sequenced trip for a Rider. |
| **`ORDER`** | Tracks the lifecycle from customer tap (`PENDING`) to pre-dispatch photo invoice (`INVOICED`), dispatch (`OUT_FOR_DELIVERY`), and doorstep completion (`DELIVERED`), including pickup time slots (`8–10 AM`, `1–3 PM`, `4–6 PM`). |
| **`PHOTO_COUNT_LOG`** | Saves the captured container load photo URL, the total count detected by the **Roboflow Gallon Detection model**, and the `bounding_boxes` JSON array (`x, y, width, height`) to render numbered boxes (`1..8`). |
| **`BILLING_DOCUMENT`** | Implements **"One Count, Two Documents"**: starts as `#INV-XXXX` before dispatch and converts into `#OR-XXXX` on delivery, adapting to `PAID_CASH`, `E_PAYMENT`, `PARTIAL`, or `UNPAID_CHARGE_SLIP`. |
| **`CONTAINER_LEDGER`** | Immutable audit log tracking every container dropped off and picked up per customer. |
