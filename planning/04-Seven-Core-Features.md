# The 7 Core Features ("One App, Seven Features")

## Overview
Everything the water refilling station writes down in a paper notebook today becomes a single tap—designed to drive a **+40% performance target**.

---

## Feature 1: Smart Routing to the Nearest Station
Optimizes dispatch and road efficiency so riders spend less fuel, miss fewer stops, and complete more deliveries per shift.
* **Nearest-Station Logic:** Incoming orders are automatically assigned to the LG Nature's Water branch closest to the customer's location, rather than whichever branch happened to answer the phone.
* **Turn-by-Turn Navigation for Riders:** Delivery teams open a single screen and follow an optimized route through every stop in sequence.
* **Automatic Stop Grouping:** Deliveries and empty container pickups located on the same street or neighborhood are grouped into a single consolidated trip.

---

## Feature 2: Scheduling & Container Pickup
Turns empty container collection into planned, predictable work instead of an unannounced interruption to the delivery run.
* **Customer-Set Schedules:** Customers select the exact day and time window that works for them (e.g., `8:00–10:00 AM`, `1:00–3:00 PM`, `4:00–6:00 PM`) and specify how many empty containers are ready—eliminating wasted trips to locked gates.
* **Container Accountability:** The system tracks exactly how many empty containers are currently out with each customer and when they are due back.
* **Automatic Reminders:** Both the station operator and the customer receive automated notifications the day before a scheduled pickup.

---

## Feature 3: One-Click Ordering
Eliminates repetitive manual encoding at the start of every transaction.
* **Saved Customer Profiles:** Stores delivery addresses, contact details, and preferred branch routing.
* **Preset Container Sizes:** Customers and operators can re-order standard refill quantities and container types with a single tap instead of rewriting details for every transaction.

---

## Feature 4: POS & Profit Tracking
Replaces the paper notebook and handheld calculator with a live digital register that tracks true profitability.
* **Preset Pricing:** Container sizes, refill rates, and delivery fees are stored once; order totals are never computed by hand again.
* **Exact Change & Balance Tracking:** Instantly computes exact change for cash transactions and flags unpaid or carried balances per customer profile.
* **True Profit Calculation:** Automatically deducts operational costs (water, electricity, and container maintenance/wear) from gross sales so operators see **true net profit**, not just gross revenue.
* **One-Tap End-of-Day Report:** Generates the daily closing summary in a single tap—eliminating the nightly chore of recopying notebook transactions.

---

## Feature 5: Photo Container Count & Instant Billing
Replaces manual counting and manual pricing of large loads with a single smartphone photo.
* **1-Snap Load Capture:** The rider or station operator points the phone camera at the containers and snaps one photo.
* **AI Object Detection & Tally:** Computer vision detects, bounding-boxes, and tallies every container in the frame—including stacked rows.
* **Instant POS Billing:** Automatically calculates `Detected Container Count × Saved Price + Delivery Fee` and posts the bill straight into the POS.
  * *Example Auto-Generated Bill:* `8 containers refilled (PHP 200.00) + Delivery fee (PHP 30.00) = Total Due PHP 230.00`.

---

## Feature 6: Automatic Invoicing vs. Official Receipt ("One Count, Two Documents")
Uses the single AI photo count to power both pre-dispatch billing and doorstep confirmation without re-encoding a single number.
* **Pre-Dispatch Invoice (`#INV`):** When the photo count is taken at the station before dispatch, the app generates an **Invoice** (e.g., `INVOICE #INV-1042 — Status: Awaiting Delivery`). The customer sees the exact amount due while the rider is still at the station.
* **Doorstep Official Receipt (`#OR`):** Upon arrival and on-site verification, that exact same photo count converts into an **Official Receipt** (e.g., `OFFICIAL RECEIPT #OR-1042 — Status: Paid`).
* **Zero Drift:** Because both documents stem from the same initial photo tally, totals cannot drift and nothing needs to be rewritten at closing. Unpaid invoices remain open in the POS automatically.

---

## Feature 7: Proof of Delivery & Smart Receipts
Combines the delivery photo and verified container count into an instant receipt—printed on the spot via a **Bluetooth thermal printer** or sent digitally via **SMS, email, or in-app notification**—with wording that dynamically adapts to four payment states:

| Payment State | How the Smart Receipt Adapts |
| :--- | :--- |
| **1. PAID (Cash)** | Cash is settled at the door. The official receipt prints on the spot and the sale closes immediately in the POS. |
| **2. E-PAYMENT** | GCash or Maya reference number is attached to the transaction, and a digital receipt copy is sent via the app and SMS. |
| **3. PARTIAL** | Both the **Amount Paid** and remaining **Balance Due** appear clearly on the receipt (e.g., *Paid PHP 130.00 / Balance Due PHP 100.00*); the unpaid balance automatically carries over to the customer's account. |
| **4. UNPAID** | Issued as a formal **Charge Slip** with a specified due date and automatically flagged on the customer's next scheduled delivery. |
