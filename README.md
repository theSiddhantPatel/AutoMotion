# AutoMotion — Live Vehicle Service Operations Dashboard

AutoMotion is a real-time operations and dispatch platform for vehicle service teams, fleet managers, technicians, and customer tracking.

---

## Key Features

- **Real-Time Operations Telemetry:** Bidirectional WebSocket streaming via Socket.io for live status updates (`Pending` -> `Assigned` -> `En Route` -> `In Progress` -> `Completed`).
- **Live Simulation Engine:** Toggleable automated engine that simulates vehicle service lifecycles and real-time metric updates.
- **Customer Tracking Portal (`/track`):** Public customer interface with a 5-stage progress tracker, assigned technician card, and an AI diagnostic assistant.
- **Executive Analytics:** Revenue trends, volume velocity, and service category breakdown charts powered by Recharts.
- **Operations Bookings Roster:** 620+ seeded records with server-side pagination, multi-criteria filters, debounced search, and dispatch drawer.
- **One-Click CSV Export:** Zero-dependency client-side export generating clean `.csv` reports for accounting and operations audits.
- **Searchable Customer Combobox & Registration:** Filter existing profiles or register new customers on the fly with atomic database linking.
- **Technician Fleet & GPS Radar:** Availability tracking, performance metrics, and interactive Leaflet map view.
- **Light & Dark Mode:** Full theme support with automatic system detection and persistent toggle.
- **Responsive Design:** Mobile drawer navigation, adaptive navbar, and swipeable tables.
- **Security & Performance:** Express rate limiting (DDoS protection with reverse proxy trust), Gzip payload compression, and Helmet security headers.
- **API Documentation:** Interactive Swagger UI available at `/api/docs`.

---

## Tech Stack & Architecture

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

## Local Setup & Installation

### Prerequisites
- **Node.js**: v18+ (Recommended v20+)
- **npm**: v9+
- **PostgreSQL Database**: Free cloud instance from [Neon DB](https://neon.tech)

---

### 1. Clone Repository
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

#### Sync Database & Seed Data:
```bash
npx prisma db push
npm run db:seed
```

#### Start Backend Server:
```bash
npm run dev
```
- API Server: `http://localhost:5000`
- Swagger Docs: `http://localhost:5000/api/docs`
- Health Check: `http://localhost:5000/api/health`

---

### 3. Frontend Setup
Open a new terminal:
```bash
cd client
npm install
npm run dev
```
- Operations Dashboard: `http://localhost:3000`
- Customer Portal: `http://localhost:3000/track`

---

## Cloud Deployment Guide

### 1. Backend (Render / Railway / AWS)
- **Root Directory:** `server`
- **Environment:** `Node`
- **Build Command:**
  ```bash
  npm install --include=dev && npx prisma generate && npm run build
  ```
  - `--include=dev`: Installs TypeScript and type definitions even when `NODE_ENV=production` is active.
  - `npx prisma generate`: Generates the typed database client inside the clean build container.
  - `npm run build`: Compiles `src/` TypeScript to `dist/` JavaScript.
- **Start Command:** `npm start`
- **Environment Variables:** `DATABASE_URL`, `NODE_ENV=production`, `CLIENT_URL`

### 2. Frontend (Vercel)
- **Root Directory:** `client`
- **Framework Preset:** `Next.js`
- **Build Command:** `next build`
- **Environment Variables:**
  - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api`
  - `NEXT_PUBLIC_SOCKET_URL`: `https://your-backend.onrender.com`

---

## API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, uptime, and database connectivity |
| `GET` | `/api/dashboard/stats` | KPI metrics (revenue, total bookings, fleet status) |
| `GET` | `/api/dashboard/analytics` | Time-series charts, status distribution, category revenue |
| `GET` | `/api/bookings` | Paginated bookings with search, status, and priority filters |
| `GET` | `/api/bookings/:id` | Single booking details with audit log trail |
| `POST` | `/api/bookings` | Create booking (supports existing ID or on-the-fly registration) |
| `PATCH` | `/api/bookings/:id/status` | Update status & broadcast live WebSocket event |
| `GET` | `/api/mechanics` | Fleet availability, ratings, active jobs, coordinates |
| `GET` | `/api/customers` | Customer directory with lifetime value calculations |
| `GET` | `/api/services` | Service catalog and base pricing |
| `POST` | `/api/simulation/start` | Start automated service transition simulation |
| `POST` | `/api/simulation/stop` | Stop operations simulation |

---

## AI Usage Transparency

In accordance with evaluation guidelines:
- **AI Tools Used:** Google Antigravity / Gemini for architecture design, rapid scaffolding, mock data modeling, and documentation.
- **Human Implementation & Review:** Schema validation rules, database indexing, WebSocket broadcast logic, UI design system, and deployment configurations were verified and refined.

---

## License
MIT License. Built for the Instant Mechanic Full Stack Engineer Evaluation.
