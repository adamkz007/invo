# 📄 Product Requirements Document (PRD): Invo POS for Restaurants

**Product Name:** Invo POS
**Owner:** Product Team, Invo
**Last Updated:** 2025-08-04
**Status:** Draft for Sprint Planning

---

## 1. 📌 Overview

**Purpose:**
Introduce a lightweight POS system within Invo for small restaurants, cafés, and food stalls to manage dine-in orders, print order chits, and track payment statuses. This module integrates with **inventory and receipts**, shows up in main dashboard, and supports **Bluetooth printing**.

**Target Users:**

* Small restaurant/café owners
* Hawkers with dine-in areas
* Food truck vendors
* Staff with minimal digital literacy

---

## 2. 🎯 Goals & Objectives

* Allow restaurant owners to take and manage orders by table
* Support offline order-taking and printing
* Track order status from creation to payment
* Integrate completed orders with the existing Receipts module
* Maintain a fluid, tap-first mobile UX

---

## 3. 🔁 Key User Flows

### 3.1 Enable POS Mode

1. User opens **Settings > Add-ons > POS Module**
2. Tap “Enable POS”
3. Choose default:

   * Table layout (Simple List / Custom Map)
   * Default printer (Bluetooth)

---

### 3.2 Take Order (Waiter View)

1. Tap **POS** tab
2. Tap **New Order**
3. Select:

   * **Table Number** (or Custom Label e.g. “Takeaway 1”, "Dine-In 4")
4. Add Items:

   * Pulls from inventory (shows available stock)
   * Add quantity
   * Optional: Add **Remarks** (e.g. “no chili”, “less ice”)
5. Tap **Send to Kitchen**

   * Order saved with status: `Send to Kitchen`
   * Bluetooth chit printed (optional confirmation)

---

### 3.3 Manage Orders

In POS > **Orders Tab**:

* List of open orders, grouped by table
* Search/filter by Table, Time, or Status

Each order card shows:

* Table
* Timestamp
* Total amount
* Status badge

**Statuses & Transitions:**

* `Send to Kitchen` → `To Pay` → `Completed`
* `Send to Kitchen` → `Cancelled`

---

### 3.4 Payment Flow

1. Tap order > tap “Mark as To Pay”
2. Confirm total & collect cash
3. Tap “Complete Order”
4. Automatically generates:

   * Receipt entry (under Receipts tab)
   * Daily sales update
   * Optional: customer summary (if tagged)

---

### 3.5 View Order History

* Search by:

  * Table name
  * Date
  * Status
  * Item name
* Export (CSV or Print summary)

---

### 3.6 Offline Support

* Orders saved locally if no connection
* Print via Bluetooth still works
* Sync to cloud once reconnected
* Offline state clearly indicated (e.g. yellow banner)

---

## 4. 🧩 Features & Requirements

### 4.1 POS Home Screen

* Tabs: **New Order, Orders, Settings**
* Quick Add: Create new order with 1 tap
* Mini-heatmap of active tables (optional)

### 4.2 Order Creation

* Real-time inventory check
* Tap-to-add items
* Add notes per item or whole order
* Table selector (editable preset list)
* Quick actions: “Repeat Last Order”, “Takeaway Mode”

### 4.3 Kitchen Chit Print

* Compatible with generic Bluetooth printers (58mm or 80mm)
* Print format:

  * Table Number
  * Timestamp
  * Items & quantity
  * Remarks
* Option to auto-print or tap to print manually

### 4.4 Order Status Tracking

* Order list with live status
* Swipe gesture to update status
* Notifications:

  * “10 min since last kitchen update”
  * “Pending payment > 30 min”

### 4.5 Integration

* ✅ Receipts: `Completed` orders auto-log in Receipts
* ✅ Inventory: Quantity decremented upon order completion
* 🔄 CRM (Future): Ability to tag customer per table/order

### 4.6 Permissions

* Merchant Mode (all logged in users): create/send orders, mark as paid, view order history, print chits, mark order as paid/cancelled

---

## 5. 🔐 Non-Functional Requirements

* Must work in low bandwidth environments
* Sync logic with conflict resolution
* Data backup locally until sync
* Secure storage of offline orders

---

## 6. ⚙️ Technical Notes

* Uses existing Supabase database
* POS orders stored separately from invoices but linked to receipts
* API endpoints:

  * `POST /orders/new`
  * `PATCH /orders/status/:id`
  * `POST /print/chit`

---

## 7. 🧪 KPIs & Success Metrics

* 📈 % of F\&B users enabling POS within 30 days
* ⏱ Avg time to complete an order
* 🧾 POS-generated receipts as % of all Receipts
* 🖨️ Printer connection success rate