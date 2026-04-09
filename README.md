# XARM Solutions CRM 🚀

A complete frontend-only Event Operations CRM built for client presentation.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Frontend Framework |
| React 18 | UI Library |
| JavaScript (.jsx) | Language |
| Tailwind CSS | Styling |
| Zustand | State Management |
| TanStack Table v8 | Data Tables |
| Lucide React | Icons |
| localStorage | Data Persistence (No Backend) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css              # Global styles + Tailwind
│   ├── layout.jsx               # Root layout with Sidebar
│   ├── page.jsx                 # Redirects to /events-log
│   ├── events-log/
│   │   └── page.jsx             # Events list, CRUD, filters
│   ├── events-health/
│   │   └── page.jsx             # Progress bars, payment health
│   ├── client-estimates/
│   │   └── page.jsx             # Version tracking, line items
│   ├── vendor-quotes/
│   │   └── page.jsx             # Quote comparison, approve/reject
│   ├── vendor-management/
│   │   └── page.jsx             # Vendor profiles, CRUD
│   ├── elements-repo/
│   │   └── page.jsx             # Inventory, qty management
│   └── payments/
│       └── page.jsx             # Incoming/outgoing, mark paid
│
├── components/
│   ├── sidebar.jsx              # Left nav - 7 tabs
│   ├── header.jsx               # Page header with actions
│   ├── table.jsx                # Reusable TanStack Table
│   ├── status-card.jsx          # Stat summary cards
│   └── modal.jsx                # Reusable modal dialog
│
├── store/
│   ├── eventStore.js            # Zustand store for events
│   ├── estimateStore.js         # Zustand store for estimates
│   ├── vendorStore.js           # Zustand store for vendors & quotes
│   └── paymentStore.js          # Zustand store for payments
│
├── utils/
│   └── localStorage.js          # Read/write helpers for localStorage
│
└── data/
    ├── events.json              # 6 sample events
    ├── vendors.json             # 5 sample vendors
    ├── estimates.json           # 2 sample estimates with versions
    └── payments.json            # 6 sample payment records
```

---

## ⚙️ Installation & Setup

### Step 1 — Install Dependencies

```bash
npm install next react react-dom
npm install zustand @tanstack/react-table lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2 — Configure Tailwind (`tailwind.config.js`)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}
```

### Step 3 — Delete Conflicting Files

Delete these default Next.js files (if they exist):
- `src/app/layout.js`
- `src/app/page.js`

Keep only the `.jsx` versions.

### Step 4 — Run the App

```bash
npm run dev
```

Open → `http://localhost:3000`

---

## 📦 Modules & Features

### 1. 📅 Events Log
- Full events table with sorting & pagination
- Search by event name or client
- Filter by status (Pending / Confirmed / In Progress / Completed)
- Add, Edit, Delete events
- Stats: Total, Confirmed, In Progress, Total Budget

### 2. 📊 Events Health
- Card-based view for every event
- **Event Progress Bar** — based on status stage
- **Payment Health Bar** — % of budget collected
- Days countdown to event (color-coded: green / amber / red)
- Shows: Budget, Guests, Manager, Vendor Expense

### 3. 📄 Client Estimates
- Create estimates with multiple line items
- **Version History** — every estimate tracks all versions with date & note
- Expand/collapse estimate to view details
- **Approve Version** — one-click approval
- **Duplicate Estimate** — clone any estimate
- Delete estimate
- Auto-calculates totals from Qty × Rate

### 4. 🛒 Vendor Quotes
- Request quotes from vendors
- **Grouped by Event + Item** — compare multiple vendor bids side by side
- **Lowest Price Badge** — auto-highlights cheapest option
- Approve / Reject quotes with one click
- Filter by status

### 5. 👥 Vendor Management
- Full vendor directory with table view
- Add, Edit, Delete vendors
- Click vendor name → view full profile in modal
- Fields: Name, Category, Type, Phone, Email, Address, GST, Rating, Notes
- Filter vendors by search

### 6. 📦 Elements Repo (Inventory)
- Item inventory with total qty & available qty
- **+/− buttons** to update available stock instantly
- **Availability progress bar** — green/amber/red based on stock %
- Low stock alert icon (< 30% available)
- Add, Edit, Delete items
- Filter by category

### 7. 💰 Payments
- Track **Incoming** (from clients) and **Outgoing** (to vendors)
- Summary cards: Total Incoming, Total Outgoing, Collected, Overdue
- Incoming & Outgoing summary breakdown panels
- **Mark as Paid** — select method (NEFT/UPI/Cheque etc.) + reference number
- Filter by All / Incoming / Outgoing
- Add new payment records

---

## 💾 Data Persistence

All data is stored in **browser localStorage** — no backend required.

| Store Key | Data |
|---|---|
| `xarm_events` | All events |
| `xarm_estimates` | All estimates + versions |
| `xarm_vendors` | All vendor profiles |
| `xarm_quotes` | All vendor quotes |
| `xarm_payments` | All payment records |
| `xarm_elements` | Inventory items |

On first load, default sample data from `/data/*.json` is auto-loaded.
After any change, data is instantly saved to localStorage.

---

## 🎨 Design

- **Theme:** Dark industrial — deep charcoal `#0d1117` background
- **Accent:** Amber/Gold `#f59e0b` for highlights and CTAs
- **Sidebar:** Fixed left, 7 navigation tabs with active state indicator
- **Tables:** TanStack Table with sort, filter, pagination
- **Modals:** Keyboard-dismissible (Esc key), backdrop blur

---

## ⚠️ Important Notes

- This is a **prototype only** — no backend, no API, no database
- Data resets if browser localStorage is cleared
- Designed for **client presentation** and UI demonstration
- All CRUD operations work fully in the browser

---

## 👤 Default Login

No authentication — opens directly to Events Log dashboard.

---

*Built for XARM Solutions — Event Operations CRM Prototype*