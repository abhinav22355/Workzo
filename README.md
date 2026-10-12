# WORKZO — On-Demand Skilled Services & Worker Marketplace

> **"Your Need. Our Professionals."**

Workzo is a production-style full-stack service marketplace web application where customers can find and book skilled workers according to their requirements—including plumbers, electricians, cleaners, carpenters, painters, AC repair technicians, appliance specialists, and more.

---

## 🌟 Table of Contents
1. [Platform Overview & Architecture](#-platform-overview--architecture)
2. [Key Features by User Role](#-key-features-by-user-role)
3. [Technology Stack](#-technology-stack)
4. [Folder Structure](#-folder-structure)
5. [Demo Accounts (Ready for Immediate Testing)](#-demo-accounts-ready-for-immediate-testing)
6. [Prerequisites & Installation](#-prerequisites--installation)
7. [Running the Application Locally](#-running-the-application-locally)
8. [Automated Testing & End-to-End Verification](#-automated-testing--end-to-end-verification)
9. [REST API Reference](#-rest-api-reference)
10. [Database Architecture & Rules](#-database-architecture--rules)
11. [Deployment Guide](#-deployment-guide)

---

## 🚀 Platform Overview & Architecture

Workzo operates around an end-to-end service lifecycle:
$$\text{Customer} \longrightarrow \text{Select Service} \longrightarrow \text{Describe Requirement} \longrightarrow \text{Select Location} \longrightarrow \text{Find Workers} \longrightarrow \text{View Profile} \longrightarrow \text{Book Worker} \longrightarrow \text{Worker Accepts} \longrightarrow \text{Service Progression} \longrightarrow \text{Payment} \longrightarrow \text{Rating}$$

### Role-Based Portals:
* **Customer Portal**: Search verified professionals, compare transparent rates, book slots without double-booking, track live progress timelines, make payments, and submit reviews.
* **Worker Portal**: Manage inbound job requests, toggle availability schedules, advance job statuses (`Accepted` $\rightarrow$ `On The Way` $\rightarrow$ `Started` $\rightarrow$ `Completed`), and view earnings statements.
* **Admin Portal**: Executive dashboard analytics, revenue charts, user management, worker verification moderation, category CRUD, and review moderation.

---

## 💼 Key Features by User Role

### 1. Customer
* **Browsing & Discovery**: Filter across 10 default categories with starting prices and live worker counters.
* **Multi-Factor Search**: Search by specialty, locality, minimum rating (3.5+ to 4.5+), price sliders, experience, and available days.
* **Worker Profile & Schedule**: Inspect detailed biographies, skill badges, working days, daily shift hours, and real customer reviews.
* **Booking Creation**: Pick service, date, time slot, address, and problem description with double-booking prevention.
* **Visual Status Timeline**:
  $$\text{Requested} \longrightarrow \text{Worker Accepted} \longrightarrow \text{On The Way} \longrightarrow \text{Service Started} \longrightarrow \text{Completed} \longrightarrow \text{Paid} \longrightarrow \text{Reviewed}$$
* **Payment**: Pay After Service / Cash confirmation or simulated Razorpay digital checkout.
* **Ratings & Reviews**: 1–5 star reviews with auto-aggregating worker average ratings.

### 2. Worker / Service Provider
* **Worker Registration**: Self-serve registration capturing profession, skills, experience, service areas, and pricing.
* **Verification Status Pipeline**: `Pending` $\rightarrow$ `Verified` / `Rejected`. (Only verified workers appear in customer search results).
* **Booking Lifecycle Controls**:
  * One-click **Accept** or **Decline** inbound requests.
  * Update to **On The Way** once dispatched.
  * Transition to **Started** once on-site.
  * Transition to **Completed** (cannot be completed before started).
* **Availability Management**: Set operating days, working hours (e.g. 09:00 to 19:00), and add holiday blackout dates.
* **Earnings & Statement**: Real-time summary of completed jobs, pending collections, and exportable statement.

### 3. Admin
* **KPI Metrics**: Total users, verified workers, pending verifications, total bookings, completed jobs, and platform gross revenue.
* **Interactive Analytics**: Revenue and booking trends over time, category popularity bars.
* **Worker Verification Management**: 1-click Verify/Approve or Reject worker applications with real-time in-app notification dispatch.
* **User Management**: Search users and toggle active/suspended status.
* **Service Categories Management**: Full CRUD to add new categories, configure starting price baselines, and select Lucide icons.
* **Review Moderation**: Delete inappropriate or spam reviews with automatic worker rating recalculation.

---

## 🛠 Technology Stack

### Frontend
* **Core**: React 18, Vite 6
* **Routing**: React Router DOM 6
* **Styling**: Tailwind CSS, PostCSS, Autoprefixer
* **Icons**: Lucide React
* **HTTP Client**: Axios with centralized auth interceptors
* **State Management**: React Context (`AuthContext`, `NotificationContext`, `ToastContext`)

### Backend
* **Runtime**: Node.js (v18+)
* **Framework**: Express.js
* **Database ODM**: Mongoose 8
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
* **Logging & CORS**: Morgan, CORS
* **Embedded DB Fallback**: `mongodb-memory-server` ensures the application runs out-of-the-box locally with zero external setup friction!

---

## 📁 Folder Structure

```
workzo/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection (Atlas / local / MongoMemoryServer fallback)
│   ├── controllers/
│   │   ├── adminController.js    # KPIs, verification, user moderation
│   │   ├── authController.js     # Register, login, profiles
│   │   ├── bookingController.js  # Booking creation, lifecycle status, payment
│   │   ├── notificationController.js
│   │   ├── reviewController.js   # Rating submission and aggregation
│   │   ├── serviceController.js  # Category queries and admin CRUD
│   │   └── workerController.js   # Advanced worker search and availability
│   ├── middleware/
│   │   ├── authMiddleware.js     # requireAuth, requireCustomer, requireWorker, requireAdmin
│   │   └── errorMiddleware.js    # Centralized error handling
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Notification.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   ├── ServiceCategory.js
│   │   ├── User.js
│   │   └── WorkerProfile.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── serviceRoutes.js
│   │   └── workerRoutes.js
│   ├── seed/
│   │   └── seed.js               # Demo dataset with 16 workers, categories, bookings
│   ├── test-flow.js              # Complete automated 15-step E2E test suite
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express server entrypoint
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookingModal.jsx
│   │   │   ├── BookingStatusBadge.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationDropdown.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RatingStars.jsx
│   │   │   ├── ServiceCard.jsx
│   │   │   └── WorkerCard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   └── WorkerLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminBookingsPage.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminPaymentsPage.jsx
│   │   │   │   ├── AdminReviewsPage.jsx
│   │   │   │   ├── AdminServicesPage.jsx
│   │   │   │   ├── AdminSettingsPage.jsx
│   │   │   │   ├── AdminUsersPage.jsx
│   │   │   │   └── AdminWorkersPage.jsx
│   │   │   ├── worker/
│   │   │   │   ├── WorkerAvailabilityPage.jsx
│   │   │   │   ├── WorkerBookingsPage.jsx
│   │   │   │   ├── WorkerDashboard.jsx
│   │   │   │   ├── WorkerEarningsPage.jsx
│   │   │   │   └── WorkerProfileEditPage.jsx
│   │   │   ├── BecomeWorkerPage.jsx
│   │   │   ├── CustomerBookingDetailPage.jsx
│   │   │   ├── CustomerBookingsPage.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── CustomerProfilePage.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── HowItWorksPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── WorkerProfilePage.jsx
│   │   │   └── WorkersPage.jsx
│   │   ├── services/
│   │   │   ├── adminService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── bookingService.js
│   │   │   ├── notificationService.js
│   │   │   ├── reviewService.js
│   │   │   ├── serviceService.js
│   │   │   └── workerService.js
│   │   ├── utils/
│   │   │   └── iconHelper.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🔑 Development Admin Account

> **⚠️ Security Warning:**
> The default credentials below are for **development and testing only**.
> **Change the default admin password before production deployment.**
> Admin credentials are not exposed on customer-facing login screens and bypass buttons are disabled.

| Attribute | Value |
| :--- | :--- |
| **Email** | `admin@workzo.com` |
| **Password** | `Admin@12345` |
| **Name** | `Workzo Admin` |
| **Role** | `admin` |
| **Admin Login URL** | `http://localhost:5173/login` |
| **Admin Dashboard URL** | `http://localhost:5173/admin/dashboard` |

### How to Run the Admin Seed Script
To explicitly initialize or update the admin account at any time:
```bash
# From the root directory:
npm run seed:admin

# Or from the backend directory:
cd backend
npm run seed:admin
```
*(Note: When the backend server boots with an empty database or memory store, it also automatically runs `seedAdmin` to ensure immediate availability).*

---

## 👥 Demo Accounts (Ready for Immediate Testing)

The database includes rich pre-populated demo data across customer and worker roles. The login page features 1-click quick-fill buttons for customer and worker accounts:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Workzo Admin | `admin@workzo.com` | `Admin@12345` | Full administrative control, verify workers, KPI metrics |
| **Worker (Plumbing)** | Raj Kumar | `raj.plumber@workzo.com` | `worker123` | Senior Plumber, 8 yrs exp, 4.9 rating |
| **Worker (Electrician)** | Ramesh Sharma | `ramesh.electrician@workzo.com` | `worker123` | Licensed Electrician, 6 yrs exp |
| **Worker (Cleaning)** | Sunita Devi | `sunita.cleaner@workzo.com` | `worker123` | Deep Sanitization Specialist, 4.9 rating |
| **Worker (AC Repair)** | Anil Mehta | `anil.ac@workzo.com` | `worker123` | HVAC Specialist, 9 yrs exp |
| **Worker (Pending Approval)** | Pankaj Tiwari | `pankaj.worker@workzo.com` | `worker123` | Use to test Admin 1-Click Verification flow! |
| **Customer** | Rahul Sharma | `rahul@workzo.com` | `customer123` | Customer with active and completed jobs |
| **Customer** | Priya Patel | `priya@workzo.com` | `customer123` | Customer with reviews submitted |

---

## 💻 Prerequisites & Installation

* **Node.js** (v18 or higher recommended)
* **npm** (v9 or higher)

### 1. Clone or Open the Workspace
```bash
cd /Users/abhinav/Documents/Workzo
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## ⚡ Running the Application Locally

### Step 1: Start Backend Server
```bash
cd backend
npm start
```
* The backend runs at: `http://localhost:5001`
* **Zero Config Setup**: If you do not have a local MongoDB instance running, the backend automatically initializes an embedded memory database and seeds all 16 workers, categories, bookings, and demo accounts!
* If you have MongoDB Atlas, you can configure your connection string in `backend/.env`:
  ```env
  MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/workzo?retryWrites=true&w=majority
  ```

### Step 2: Start Frontend Application
In a separate terminal:
```bash
cd frontend
npm run dev
```
* Open your browser at: `http://localhost:5173`

---

## 🧪 Automated Testing & End-to-End Verification

You can run the comprehensive 15-step automated user flow test at any time:
```bash
cd backend
node test-flow.js
```
The test suite validates:
1. API Health Check
2. Service Categories retrieval
3. Worker search with filters
4. Customer authentication
5. Customer booking placement (double-booking validation)
6. Worker authentication
7. Worker accepting booking
8. Worker dispatched (`ON_THE_WAY`)
9. Worker on-site work started (`STARTED`)
10. Worker marking completed (`COMPLETED`)
11. Customer payment settlement
12. Customer rating and review submission
13. Admin authentication
14. Admin verifying pending worker applicant
15. Admin KPI dashboard metrics retrieval

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register`: Create customer or worker account
* `POST /api/auth/login`: Authenticate and obtain JWT
* `GET /api/auth/profile`: Get current authenticated user details
* `PUT /api/auth/profile`: Update user information & worker specs

### Services (`/api/services`)
* `GET /api/services`: List active service categories (public)
* `GET /api/services/:id`: Get category by ID
* `POST /api/services`: Create new category (Admin only)
* `PUT /api/services/:id`: Update category (Admin only)
* `DELETE /api/services/:id`: Delete category (Admin only)

### Workers (`/api/workers`)
* `GET /api/workers`: Advanced search & filter workers (by category, rating, experience, price, area, day)
* `GET /api/workers/:id`: Worker profile, ratings, and customer reviews
* `GET /api/workers/:id/availability`: Check booked slots for a given date
* `PUT /api/workers/profile`: Update worker profile, pricing, and availability (Worker only)

### Bookings (`/api/bookings`)
* `POST /api/bookings`: Create booking (Customer only)
* `GET /api/bookings`: Fetch bookings (filtered by role and status)
* `GET /api/bookings/:id`: Booking details with activity timeline
* `PUT /api/bookings/:id/status`: Advance job status (`ACCEPTED`, `REJECTED`, `ON_THE_WAY`, `STARTED`, `COMPLETED`, `CANCELLED`)
* `POST /api/bookings/:id/payment`: Record payment settlement

### Reviews (`/api/reviews`)
* `POST /api/reviews`: Submit review for completed booking (Customer only)
* `GET /api/reviews/worker/:workerId`: View all reviews for a worker
* `DELETE /api/reviews/:id`: Delete review (Admin moderation)

### Admin Operations (`/api/admin`)
* `GET /api/admin/dashboard`: Metrics, trajectory charts, and popular services
* `GET /api/admin/users`: User management with role and status filtering
* `PUT /api/admin/users/:id/status`: Toggle user account suspension
* `GET /api/admin/workers`: Workers registry with verification status filtering
* `PUT /api/admin/workers/:id/verify`: Approve (`verified`) or `rejected` status
* `GET /api/admin/bookings`: Full audit of all bookings
* `GET /api/admin/payments`: Transaction history ledger
* `GET /api/admin/reviews`: Review moderation feed

---

## 🔒 Database Architecture & Rules

1. **Double-Booking Prevention**: Customers cannot place overlapping bookings with the same worker, and workers cannot accept overlapping confirmed bookings on the same date/time slot.
2. **Booking Completion Guard**: A booking cannot be marked as `COMPLETED` before it is marked `STARTED`.
3. **Review Integrity**: Only the customer who booked the service can submit a review, and only after the booking status is `COMPLETED`. Duplicate reviews per booking are disallowed.
4. **Rating Aggregation**: Submitting or deleting a review automatically updates the worker's average rating and total review counts in real time.
5. **Suspension Enforcement**: Inactive or suspended accounts cannot create or accept bookings.

---

## 🌐 Deployment Guide

### Frontend (e.g. Vercel)
1. Set root directory to `frontend`.
2. Configure build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable:
   ```env
   VITE_API_URL=https://your-workzo-backend.onrender.com/api
   ```

### Backend (e.g. Render / Railway)
1. Set root directory to `backend`.
2. Configure start command: `npm start`
3. Configure environment variables in dashboard:
   ```env
   NODE_ENV=production
   PORT=5001
   CLIENT_URL=https://workzo.vercel.app
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/workzo
   JWT_SECRET=production_secure_jwt_secret_key_here
   ```

---

© 2026 Workzo Inc. Engineered for excellence.
