# 🚗 AutoMotion — Live Vehicle Service Operations Dashboard

AutoMotion is a production-grade, real-time SaaS operations platform built for vehicle service dispatchers, fleet operations managers, and mobile technicians.

---

## 🌟 Live Features & Highlights

- ⚡ **Real-Time Operations Telemetry:** Bidirectional WebSocket streaming powered by Socket.io (`Pending` $\to$ `Assigned` $\to$ `En Route` $\to$ `In Progress` $\to$ `Completed`).
- 🤖 **Interactive Live Simulation Engine:** One-click toggle in the navbar that automatically progresses live vehicle dispatch states to demonstrate real-time telemetry.
- 📊 **Executive Performance Analytics:** 30/60/90-day revenue trends, booking volume velocity, and service category breakdown charts.
- 📋 **Operations Bookings Roster:** 620+ seeded records with multi-criteria server-side filtering, instant keyword search, priority badges, pagination, and slide-over dispatch detail drawer.
- 👨‍🔧 **Technician Fleet Management & GPS Radar:** Live mechanic availability roster with ratings, job counts, and interactive GPS dispatch radar.
- 📖 **Interactive Swagger / OpenAPI Documentation:** Direct in-browser API explorer and testing playground at `/api/docs`.

---

## 🛠️ Tech Stack & Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Client)                      │
│   Next.js (App Router) + TypeScript + Tailwind CSS + Lucide │
│          Recharts (Analytics) + Socket.io Client            │
└──────────────────────────────┬──────────────────────────────┘
                               │  REST API + WebSockets
┌──────────────────────────────▼──────────────────────────────┐
│                      Backend (Server)                       │
│      Node.js + Express + TypeScript + Socket.io Server      │
│             Zod Validation + Helmet + Morgan                │
│                 Swagger / OpenAPI Specs                     │
└──────────────────────────────┬──────────────────────────────┘
                               │  Prisma ORM
┌──────────────────────────────▼──────────────────────────────┐
│                 Cloud Database (Neon DB)                    │
│    PostgreSQL (Bookings, Mechanics, Customers, Services)    │
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

---

### 3. Frontend Setup
Open a new terminal:
```bash
cd client
npm install
npm run dev
```
* Frontend Dashboard will open at: `http://localhost:3000`

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check and uptime |
| `GET` | `/api/dashboard/stats` | High-level KPI metrics (revenue, total bookings, fleet status) |
| `GET` | `/api/dashboard/analytics` | Time-series charts, status distributions, and category revenue |
| `GET` | `/api/bookings` | Paginated bookings with search, status, and priority filters |
| `GET` | `/api/bookings/:id` | Single booking details with full audit log trail |
| `POST` | `/api/bookings` | Create new vehicle booking with Zod validation |
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
