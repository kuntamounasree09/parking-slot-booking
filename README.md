# ParkEase: Parking Slot Booking with Time-Based Billing

A full-stack, enterprise-grade parking management and slot reservation platform built for modern urban facilities. Features dynamic visual slot matrices, authoritative backend time-based billing, atomic double-booking prevention, role-based access control (Customer & Administrator), interactive financial analytics with Recharts, and printable receipts.

Developed as a **Full Stack Web Development B.Tech Capstone Course Project**.

---

## 🌟 Key Features

### 1. Authoritative Time-Based Billing Engine
- **Per-minute exact billing**: The server computes total charges based on the exact reservation interval in minutes:
  $$\text{Total Amount} = \text{round}\left(\frac{\text{durationMinutes}}{60} \times \text{hourlyRate}, 2\right)$$
- **Examples**:
  - 1 Hour @ ₹40/hr = **₹40**
  - 2 Hours @ ₹40/hr = **₹80**
  - 3.5 Hours (210 mins) @ ₹40/hr = **₹140**
  - 1 Hour 15 Mins (75 mins) @ ₹40/hr = **₹50**
- Minimum reservation duration: 30 minutes.
- Full server-side price calculation prevents client-side tampering.

### 2. Concurrency & Double-Booking Prevention
- Slots cannot be double-booked for overlapping intervals:
  $$\text{Overlap} \iff \text{existing.start\_time} < \text{requested.end\_time} \quad \text{AND} \quad \text{existing.end\_time} > \text{requested.start\_time}$$
- Active and confirmed bookings lock the slot; overlapping attempts return `HTTP 409 Conflict`.
- Consecutive bookings (e.g. 10:00-12:00 and 12:00-14:00) are permitted.

### 3. Visual Interactive Slot Matrix
- Real-time slot layout organized by floor (Ground Floor, Basement P1, Level 2).
- Distinct visual status states:
  - 🟢 **Available (Green)**: Open for selection and booking.
  - 🔴 **Booked (Red)**: Reserved by another customer for the requested time.
  - 🔵 **Selected (Blue)**: Currently selected by the active user.
  - ⚪ **Maintenance (Gray)**: Out of order, disabled.

### 4. Role-Based Access Control (RBAC)
- **Customer (USER)**: Find parking, live bill calculator, reserve slots, view booking history, print official receipts, cancel eligible upcoming bookings, manage profile.
- **Administrator (ADMIN)**: Executive KPI cards, Recharts time-series analytics (daily revenue, slot occupancy, status distribution), manage parking locations, add/edit slots, toggle maintenance mode, manage reservations, and manage user accounts.

### 5. Printable Receipt & Entry Pass
- Clean invoice layout formatted for `@media print` with reference code, QR/barcode simulation, vehicle registration, and timestamps.

---

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Axios, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, TypeScript, PostgreSQL Client (`pg`), JWT, bcryptjs, Zod, ts-node-dev |
| **Database** | PostgreSQL 18 relational database with constraints, foreign keys, and conflict detection indexes |
| **Development** | Visual Studio Code, PowerShell / Bash, npm |

---

## 📂 Project Directory Structure

```text
parking-system/
│
├── database/
│   ├── schema.sql           # Complete PostgreSQL DDL (users, locations, slots, bookings)
│   └── seed.sql             # SQL seed dataset with demo users, locations, and slots
│
├── backend/
│   ├── src/
│   │   ├── config/          # PostgreSQL connection pool configuration
│   │   ├── controllers/     # Auth, Locations, Slots, Bookings, Admin controllers
│   │   ├── middleware/      # JWT auth, Admin RBAC, centralized error handling
│   │   ├── models/          # TypeScript interfaces and data types
│   │   ├── routes/          # RESTful Express route definitions
│   │   ├── scripts/         # Automated setupDb.ts and seedDb.ts runners
│   │   ├── services/        # BillingService (pricing math) & ConflictService (overlap check)
│   │   └── server.ts        # Express application entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, Sidebar, SlotGrid, LiveBillCard, ReceiptModal, etc.
│   │   ├── context/         # AuthContext (JWT persistence) & ToastContext (popups)
│   │   ├── pages/
│   │   │   ├── public/      # LandingPage, HowItWorksPage, LoginPage, RegisterPage
│   │   │   ├── user/        # UserDashboard, LocationsPage, SlotBookingPage, MyBookings, etc.
│   │   │   └── admin/       # AdminDashboard, ManageLocations, ManageSlots, RevenueReports, etc.
│   │   ├── services/        # Axios API client functions
│   │   ├── types/           # Frontend TypeScript types
│   │   ├── App.tsx          # Router layout and route guards
│   │   ├── main.tsx         # React root
│   │   └── index.css        # Tailwind directives and print stylesheet
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── setup-db.ps1             # Local interactive database setup helper
├── README.md
└── .gitignore
```

---

## ⚡ Quick Setup & Running in VS Code

### Step 1: Open the Project in VS Code
Open the root directory in VS Code:
```powershell
code c:\Users\mouna\OneDrive\Desktop\parking-system
```

---

### Step 2: Database Initialization (PostgreSQL)

You can set up the database using the automated script or standard psql:

#### Option A: Using the Automated Script (Recommended)
Open a terminal in VS Code (`Ctrl + ` `) and run:
```powershell
.\setup-db.ps1
```
This will prompt you for your PostgreSQL `postgres` user password, create the `parking_db` database, apply `database/schema.sql`, and automatically generate `backend/.env` with your credentials!

#### Option B: Manual Setup via `psql`
```powershell
# 1. Create database
psql -U postgres -h localhost -c "CREATE DATABASE parking_db;"

# 2. Run schema
psql -U postgres -h localhost -d parking_db -f "database/schema.sql"

# 3. Configure backend/.env
# Copy backend/.env.example to backend/.env and update DB_PASSWORD
```

---

### Step 3: Install Dependencies & Seed Demo Data

#### In Terminal 1 (Backend):
```powershell
cd backend
npm install
npm run db:setup    # Applies database schema
npm run db:seed     # Seeds demo admin, users, locations, slots, and bookings
npm run dev         # Starts backend API on http://localhost:5000
```

#### In Terminal 2 (Frontend):
```powershell
cd frontend
npm install
npm run dev         # Starts Vite dev server on http://localhost:5173
```

---

### Step 4: Open in Browser
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🔑 Demo Login Credentials

For demonstration and faculty evaluation, use these pre-seeded accounts (or use the one-click autofill buttons on the login page):

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Administrator** | `admin@parking.com` | `Admin@123` | Full access to Admin Dashboard, Analytics, Location & Slot Management, Global Bookings, and User Directory |
| **Customer (User)** | `user@parking.com` | `User@123` | Slot Booking, Live Billing Calculator, Personal Dashboard, My Bookings, Receipts, Cancellations |
| **Customer (User 2)** | `sarah@parking.com` | `User@123` | Customer account with past booking history |

---

## 📋 REST API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get current authenticated user profile & summary metrics
- `PUT /api/auth/profile` — Update name, phone, or password

### Locations
- `GET /api/locations` — List all active facilities with slot count metrics
- `GET /api/locations/:id` — Location details
- `POST /api/locations` — Create new facility (Admin only)
- `PUT /api/locations/:id` — Update facility hours, rates, or status (Admin only)
- `DELETE /api/locations/:id` — Delete facility (Admin only)

### Slots & Availability
- `GET /api/locations/:id/slots` — Get slots for a location; accepts `?startTime=...&endTime=...` to dynamically return slot status (`AVAILABLE`, `BOOKED`, `MAINTENANCE`)
- `POST /api/locations/:id/slots` — Add parking slot (Admin only)
- `PUT /api/slots/:id` — Update slot vehicle type or toggle maintenance (Admin only)
- `DELETE /api/slots/:id` — Delete slot (Admin only)

### Bookings & Billing
- `POST /api/bookings/calculate` — Preview authoritative time-based cost calculation
- `POST /api/bookings` — Create reservation with atomic double-booking conflict detection
- `GET /api/bookings` — Get booking history with status filters
- `GET /api/bookings/:id` — Get full booking details and receipt data
- `PUT /api/bookings/:id/cancel` — Cancel eligible upcoming booking and release slot

### Admin Analytics & Management
- `GET /api/admin/dashboard` — Executive KPI metrics (revenue, utilization, bookings)
- `GET /api/admin/revenue` — Recharts time-series trends (14-day revenue, occupancy, status distribution)
- `GET /api/admin/users` — List registered customers with reservation counts & total spend
- `DELETE /api/admin/users/:id` — Delete customer account (self-deletion disabled)

---

## 🎯 Faculty Demonstration Script

Follow this step-by-step flow during project presentation:

1. **Home / Landing Page**: Show the modern SaaS interface, live billing simulator slider, and feature highlights.
2. **Customer Registration / Login**: Sign in as `user@parking.com` or create a new user.
3. **Location Selection**: Click **Find Parking** to view operational venues, rates (₹40–₹70/hr), and available slots.
4. **Interactive Slot Reservation**:
   - Choose a venue (e.g. *Tech City Silicon Gateway*).
   - Adjust date and hours (e.g. 10:00 AM to 1:30 PM = 3.5 hrs).
   - Observe slots dynamically update to **Green (Available)**, **Red (Booked)**, or **Gray (Maintenance)**.
   - Click an available slot (e.g. `T02`) &rarr; turns **Blue (Selected)**.
   - Observe live cost update: ₹40/hr × 3.5 hrs = **₹140**.
   - Enter vehicle registration (e.g. `KA-01-MJ-1024`) and click **Confirm Booking**.
5. **Confirmation & Receipt**:
   - View booking code `PRK-XXXXXX`.
   - Click **Print Receipt** to display the official printable pass.
6. **Double-Booking Prevention Test**:
   - Return to the same location and select the exact same slot `T02` for overlapping time (e.g. 11:00 AM to 1:00 PM).
   - Observe the slot is marked **Booked (Red)**, or if submitted, the backend rejects it with `HTTP 409 Conflict`.
7. **My Bookings & Cancellation**:
   - Open **My Bookings**.
   - Filter by `Upcoming` and click **Cancel** on the reservation to verify the slot is released.
8. **Admin Portal**:
   - Sign in as `admin@parking.com`.
   - Demonstrate the **Admin Dashboard** with Recharts AreaChart (14-day revenue), PieChart (slot utilization), and BarChart (facility earnings).
   - Navigate to **Manage Locations** and create a new venue or adjust base rates.
   - Navigate to **Manage Slots** and toggle a slot into Maintenance mode.
   - Navigate to **Manage Users** and view customer metrics.
