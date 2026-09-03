# 🚗 AutoMotion — Live Vehicle Service Operations Dashboard

AutoMotion is a production-grade, real-time SaaS operations platform built for vehicle service dispatchers, fleet operations managers, mobile technicians, and customer self-service.

---

## 🌟 Live Features & Highlights

- ⚡ **Real-Time Operations Telemetry:** Bidirectional WebSocket streaming powered by Socket.io (`Pending` $\to$ `Assigned` $\to$ `En Route` $\to$ `In Progress` $\to$ `Completed`).
- 🤖 **Interactive Live Simulation Engine:** One-click toggle in the navbar that automatically advances live vehicle dispatch states to demonstrate real-time telemetry.
- 📱 **Live Customer Tracking Portal (`/track`):** An authentic consumer experience featuring a 5-stage live progress stepper, assigned technician profile (photo, rating, direct call button), and an interactive **AI Car Diagnosis Assistant**.
- 📊 **Executive Performance Analytics:** 30/60/90-day revenue trends, booking volume velocity, and service category breakdown charts powered by Recharts.
- 📋 **Operations Bookings Roster:** 620+ seeded records with multi-criteria server-side filtering, debounced search, priority badges, pagination, and slide-over dispatch detail drawer.
- 📥 **One-Click CSV Operations Export:** Client-side zero-dependency export that downloads filtered dispatch records into Excel-ready `.csv` reports for accounting and auditing.
- 🔍 **Searchable Customer Combobox & On-the-Fly Registration:** Dispatchers and walk-in customers can search 60+ registered profiles or register a brand-new customer on the fly with atomic database linking.
- 👨‍🔧 **Technician Fleet Management & GPS Radar:** Live mechanic availability roster with ratings, job counts, and interactive Leaflet GPS dispatch radar.
- ☀️🌙 **Dual Light & Dark Mode:** Seamless theme switching with high-contrast light mode for daytime dispatching and sleek dark mode for control rooms.
- 📱 **100% Mobile Responsive:** Slide-out drawer navigation, fluid navbar controls, and touch-optimized swipeable tables for field operations on phones and tablets.
- 🛡️ **Production Security & Performance:** Configured with `express-rate-limit` (DDoS mitigation with reverse-proxy trust), `compression` (Gzip/Brotli payload compression saving 75% bandwidth), and `helmet` security headers.
- 📖 **Interactive Swagger / OpenAPI Documentation:** Direct in-browser API explorer and testing playground at `/api/docs`.

---

## 🛠️ Tech Stack & Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Client)                      │
│   Next.js (App Router) + TypeScript + Tailwind CSS v4       │
│   Recharts (Analytics) + Leaflet (GPS) + Socket.io Client   │
│   Light / Dark Mode + Mobile Drawer + CSV Reporting Export  │
└──────────────────────────────┬──────────────────────────────┘
                               │  REST API + WebSockets
┌──────────────────────────────▼──────────────────────────────┐
│                      Backend (Server)                       │
│      Node.js + Express + TypeScript + Socket.io Server      │
│      Rate Limiting + Gzip Compression + Helmet + Morgan     │
│      Zod Validation + Swagger / OpenAPI Specs               │
└──────────────────────────────┬──────────────────────────────┘
                               │  Prisma ORM
┌──────────────────────────────▼──────────────────────────────┐
│                 Cloud Database (Neon DB)                    │
│    PostgreSQL (Bookings, Mechanics, Customers, Services)    │
│    620+ Seeded Historical & Active Operations Records       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js**: v18+ (Recommended v20+)
- **npm**: v9+
- **PostgreSQL Database**: Free cloud instance from [Neon DB](https://neon.tech)

---

### 1. Clone the Repository
```bash
git clone https://github.com/theSiddhantPatel/AutoMotion.git
cd AutoMotion
```

---

### 2. Backend Setup
```bash
cd server
npm install
```

#### Configure Environment Variables (`server/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="your-neon-postgresql-connection-string"
CLIENT_URL="http://localhost:3000"
```

#### Sync Database & Seed 600+ Records:
```bash
npx prisma db push
npm run db:seed
```

#### Start Backend API Server:
```bash
npm run dev
```
* API Server will run at: `http://localhost:5000`
* Interactive Swagger API Docs: `http://localhost:5000/api/docs`
* Health Check: `http://localhost:5000/api/health`

---

### 3. Frontend Setup
Open a new terminal:
```bash
cd client
npm install
npm run dev
```
* Frontend Dashboard will open at: `http://localhost:3000`
* Customer Portal will open at: `http://localhost:3000/track`

---

## ☁️ Cloud Deployment Guide

### 1. Backend Deployment (Render / Railway / AWS)
* **Root Directory:** `server`
* **Environment:** `Node`
* **Build Command:**
  ```bash
  npm install --include=dev && npx prisma generate && npm run build
  ```
  * **Why `--include=dev`?** Forces `npm` to install TypeScript compiler and `@types/*` even when `NODE_ENV=production` is set in cloud containers.
  * **Why `npx prisma generate`?** Generates the custom PostgreSQL typed database client inside the clean cloud build container.
  * **Why `npm run build`?** Compiles all TypeScript files from `src/` into fast JavaScript in `dist/`.
* **Start Command:**
  ```bash
  npm start
  ```
* **Environment Variables on Cloud Host:**
  * `DATABASE_URL`: Your cloud PostgreSQL connection string (Neon DB).
  * `NODE_ENV`: `production`
  * `CLIENT_URL`: `*` (or your live Vercel URL)

### 2. Frontend Deployment (Vercel)
* **Root Directory:** `client`
* **Framework Preset:** `Next.js`
* **Build Command:** `next build` (default)
* **Environment Variables:**
  * `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api`
  * `NEXT_PUBLIC_SOCKET_URL`: `https://your-backend.onrender.com`

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check, uptime, and database connectivity |
| `GET` | `/api/dashboard/stats` | High-level KPI metrics (revenue, total bookings, fleet status) |
| `GET` | `/api/dashboard/analytics` | Time-series charts, status distributions, and category revenue |
| `GET` | `/api/bookings` | Paginated bookings with debounced search, status, and priority filters |
| `GET` | `/api/bookings/:id` | Single booking details with full audit log trail |
| `POST` | `/api/bookings` | Create new booking (supports existing ID or on-the-fly new customer) |
| `PATCH` | `/api/bookings/:id/status` | Update booking status & broadcast live WebSocket event |
| `GET` | `/api/mechanics` | Fleet availability, ratings, active jobs, and coordinates |
| `GET` | `/api/customers` | Customer directory with lifetime value calculations |
| `GET` | `/api/services` | Automotive service catalog and standard pricing |
| `POST` | `/api/simulation/start` | Start live automated vehicle service transition simulation |
| `POST` | `/api/simulation/stop` | Stop live operations simulation |

---

## 🤖 AI Usage Transparency

In accordance with assignment guidelines:
- **AI Tools Used:** Google Antigravity / Gemini for architectural design, rapid scaffolding, realistic seed data modeling, and documentation.
- **Human Implementation & Review:** Schema validation rules, database indexing, WebSocket broadcast logic, responsive UI design system, and deployment configurations were verified and refined.

---

## 📜 License
MIT License. Built for the Instant Mechanic Full Stack Engineer Evaluation.
