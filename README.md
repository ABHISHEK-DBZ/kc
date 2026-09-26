# KhataCopilot HQ — Autonomous Multi-Agent Retail Operations Platform

<div align="center">

![KhataCopilot HQ Logo](./public/logo.png)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933.svg?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000.svg?logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57.svg?logo=sqlite)](https://www.sqlite.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2016-3ECF8E.svg?logo=supabase)](https://supabase.com/)
[![Flutter](https://img.shields.io/badge/Flutter-Android%20Mobile-02569B.svg?logo=flutter)](https://flutter.dev/)
[![Groq AI](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F55036.svg)](https://groq.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Autonomous%20Multi--Agent-success.svg)](#-autonomous-ai-agents)
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](#-testing--validation)

**An enterprise-grade, real-time, authenticated, multi-agent retail operating network.**  
*Bridging corporate headquarters, regional directors, franchise owners, and store counters through autonomous backend AI agents, predictive inventory intelligence, cloud Supabase synchronization, and Apple-inspired Human Interface Guidelines (HIG).*

</div>

---

## 📌 Executive Overview

KhataCopilot HQ transforms traditional retail operations into an **autonomous, self-governing retail network**. 

Instead of store managers and executives manually reviewing thousands of spreadsheets and registers, **8 server-side autonomous AI agents** continuously scan real normalized database records, detect stockouts and cash variances, calculate risk velocity, draft purchase orders, cascade operational events, and present actionable findings for human-in-the-loop approval.

---

## 🚀 Key Feature: AI Purchase Recommendation & Smart Reorder Intelligence

The **Autonomous Inventory Agent** includes an enterprise-grade Smart Reorder Intelligence engine that transforms stock analysis from passive charts into deterministic purchasing actions.

```
       [ Real Sales & Inventory Signals ]
     (Stock, 7d/14d/30d Velocity, Margins, Lead Time)
                         │
                         ▼
       ┌───────────────────────────────────┐
       │   Deterministic Engine (Zero-LLM) │
       │  - Projected Demand Calculation   │
       │  - Stock Coverage Days Formula    │
       │  - Exact Order Quantity Math      │
       │  - Profit Opportunity Estimation  │
       └─────────────────┬─────────────────┘
                         │
                         ▼
       ┌───────────────────────────────────┐
       │  Server-Side Groq AI Explanation  │
       │  - Plain-English Root Cause       │
       │  - Demand Trend Summaries         │
       │  - Transparent Signals Snapshot   │
       └─────────────────┬─────────────────┘
                         │
                         ▼
       ┌───────────────────────────────────┐
       │   Actionable Purchase Workflow    │
       │  - Persisted in SQLite & Supabase │
       │  - [Create PO Draft] in 1-Click   │
       │  - Human-in-the-Loop Review       │
       └───────────────────────────────────┘
```

### Deterministic Recommendation Engine
Every recommendation is classified through strict mathematical rules:
- `URGENT_REORDER`: Stockout expected before standard lead time delivery ($\text{Stock Coverage} \le \text{Lead Time}$).
- `BUY_MORE`: Accelerating demand growth ($>+14\%$ 30-day trend) with under 1 week of stock coverage.
- `BUY_NOW`: Current inventory has breached the calculated reorder threshold.
- `BUY_NORMAL`: Approaching replenishment window with healthy sales velocity.
- `WAIT`: Stock levels cover current demand comfortably.
- `DO_NOT_BUY`: Severe decline in velocity ($<-25\%$ trend) or stock coverage exceeding 90+ days.
- `SLOW_MOVING`: Velocity $<0.5\text{ units/day}$ with multiple weeks of stagnant inventory.
- `OVERSTOCK_RISK`: Excessive inventory coverage ($>50\text{ days}$) risking capital freeze and dead stock.

### Transparent Suggested Order Quantity Formula
The agent computes recommended order quantities through a transparent deterministic formula:
$$\text{Projected Demand} = \text{Daily Sales Velocity} \times (\text{Lead Time Days} + \text{Target Cycle Days})$$
$$\text{Gross Needed} = \text{Projected Demand} + \text{Safety Stock} - \text{Current Stock}$$
$$\text{Suggested Order Qty} = \begin{cases} 0 & \text{for DO\_NOT\_BUY, OVERSTOCK\_RISK, WAIT, SLOW\_MOVING} \\ \max(\text{Min Order}, \text{Gross Needed} \times 1.20) & \text{for BUY\_MORE (20\% growth buffer)} \\ \max(\text{Min Order}, \max(0, \text{Gross Needed})) & \text{for BUY\_NOW, BUY\_NORMAL, URGENT\_REORDER} \end{cases}$$

### Profit Opportunity (Non-Guaranteed Estimates)
Products are categorized by potential return on capital:
- **HIGH**: Unit profit $\ge ₹15$ or margin $\ge 14\%$ with sales trend $\ge +10\%$ and coverage $\le 8\text{ days}$.
- **MEDIUM**: Healthy margins with stable demand.
- **LOW / NEUTRAL**: Stagnant, low-margin, or overstocked items.

### Human-in-the-Loop PO Workflow
Recommendations are not simulated. Clicking **`Create Purchase Order Draft`**:
1. Creates an authentic purchase order in `purchase_orders` with status `'Awaiting Approval'`.
2. Generates an `agent_task` assigned to headquarters/franchise owners.
3. Links the PO draft to `recommendation_id` for complete auditability.
4. Updates the recommendation state to `'ORDERED'`.

---

## ⚡ Real-Time Cloud Synchronization (Supabase)

KhataCopilot features a hybrid database architecture:
- **Edge/Local**: Fast embedded SQLite database with Write-Ahead Logging (WAL) for microsecond latency.
- **Cloud/Global**: Synchronized with a live **Supabase PostgreSQL 16+** project (`zyobbtldnabwucbwhbuo.supabase.co`).

```
                    ┌────────────────────────────┐
                    │      KhataCopilot HQ       │
                    │   Node.js / Express Server │
                    └──────┬──────────────┬──────┘
                           │              │
                     Microsecond API      Cloud Sync
                           │              │
                           ▼              ▼
                 ┌──────────────────┐  ┌──────────────────┐
                 │  Local SQLite    │  │  Supabase Cloud  │
                 │  khatacopilot.db │  │  PostgreSQL 16   │
                 └──────────────────┘  └──────────────────┘
```

- **Live Endpoints**:
  - `GET /api/supabase/status` — Reports active connection and configuration status.
  - `POST /api/supabase/test` — Performs real-time ping check against Supabase endpoint.
  - `POST /api/supabase/sync` — Synchronizes shops, inventory items, purchase orders, recommendations, and community posts.
- **Schema Migration**: Ready-to-apply 45+ table PostgreSQL schema located in `supabase/migrations/20260926000000_networkos_core_schema.sql`.

---

## 🤖 The 8 Autonomous AI Retail Agents

Each agent operates within its own dedicated workspace shell with live findings, mathematical evidence, task history, and run telemetry:

| Agent | Workspace Route | Cadence / Trigger | Mathematical Logic / Primary Function | Action Generated |
| :--- | :--- | :--- | :--- | :--- |
| **1. Sales Intelligence** | `/agents/sales` | Every 10 min + On-Demand | Detects category margin compression ($<10\%$) vs $14\%$ target baseline. | Gross margin optimization directive |
| **2. Inventory Agent** | `/agents/inventory` | Every 3 min + On-Demand | Analyzes burn rate, stockout runway, and generates **Smart Reorder Intelligence**. | **Automated Purchase Order Draft** (`PO-2026-INV-...`) |
| **3. Udhaar Risk Agent** | `/agents/udhaar-risk` | Every 10 min + On-Demand | Identifies accounts overdue $>45\text{ days}$ with zero repayments. | Debt collection reminder dispatch & credit freeze |
| **4. Revenue Anomaly Agent**| `/agents/revenue-anomaly` | Every 5 min + On-Demand | Flags $>15\%$ drop between recent 7-day and previous 7-day moving averages. | Store audit & price-competitiveness review |
| **5. Cash Risk Agent** | `/agents/cash-risk` | Every 10 min + On-Demand | POS expected register cash vs. physical drawer count ($< -₹500$). | Till shortage investigation & cashier audit |
| **6. Shop Health Agent** | `/agents/shop-health` | Every 5 min + Cascaded | Multi-factor health index (0–100) aggregating margin, debt, till shortages, and stockouts. | Updates branch tier (`Healthy`, `Watch`, `At-Risk`) |
| **7. Retention Agent** | `/agents/retention` | Event-triggered + 10 min | Listens for `SHOP_HEALTH_DEGRADED` or health score $<60$. | **Field Manager Intervention Dispatch** |
| **8. Support / Community**| `/agents/support` | Event-driven (`POST_CREATED`)| Groq AI NLP triage matching symptoms to verified known issues (e.g. `BUG-1821`). | Auto-replies with verified workaround solution |

---

## 🔐 Role-Based Access Control (RBAC) & Scope Matrix

Authentication is enforced on the server via signed JSON Web Tokens (JWT) with bcrypt password hashing:

| Persona | Demo Email | Territory / Data Visibility | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **HQ Owner** | `hq.owner@demo.khatacopilot.com` | **Global Enterprise**: All 16 stores, all territories (West, North, South). | Full administrative control, agent execution, PO approvals, GST reports, company settings. |
| **HQ IT Support** | `hq.it@demo.khatacopilot.com` | **Technical Operations**: Read-only branch inspection, full support network. | Technical community triage, known bug directory, agent observability, diagnostics. |
| **Area Manager** | `area.manager@demo.khatacopilot.com` | **West Region (Maharashtra)**: Only Pune, Mumbai, Nashik, Thane, Nagpur. | Regional KPI monitoring, local agent execution, field staff dispatch. |
| **Franchise Owner** | `franchise.owner@demo.khatacopilot.com` | **Patel Retail Network**: Only assigned franchise stores. | Franchise profitability, inventory health, store manager oversight. |
| **Store Manager** | `store.manager@demo.khatacopilot.com` | **Single Counter**: Exclusively Sharma General Store (`shop-01`). | Local till reconciliation, stock alerts, local Khata credit book. |

> **Universal Demo Password:** `DemoPass2026!`  
> *(The login screen features a 1-click persona quick-picker to switch roles instantly for evaluation).*

---

## 📱 KhataCopilot NetworkOS Mobile (Flutter App)

The repository includes a companion mobile app for Android located in [`android/`](./android/):
- **Counter Diagnostics**: Live POS status checks and issue reporting.
- **Community Resolution Loop**: Ask questions, receive AI-matched solutions, and browse verified knowledge base articles.
- **Mobile Realtime Channel**: Live operational notifications and task approvals on the go.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Web Frontend** | React 19, TypeScript, Vite 8, Lucide Icons, Custom Apple HIG Design Tokens |
| **Mobile App** | Flutter 3.x / Dart (Android, iOS ready), Material 3 styling |
| **Backend API** | Node.js, Express 5, TypeScript (`tsx` runner), RESTful endpoints |
| **Local Database** | SQLite 3 via `better-sqlite3` (WAL mode, Foreign Keys, Synchronous NORMAL) |
| **Cloud Database** | Supabase PostgreSQL 16+ via `@supabase/supabase-js` |
| **Realtime Stream** | Server-Sent Events (SSE) with authenticated territorial scope filters |
| **AI Reasoning Layer** | Groq SDK (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`), JSON mode schemas |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs`, local storage session manager |
| **Testing** | Automated verification suites (`test_smart_reorder.ts`, `test_e2e_full.ts`, `audit_verifier.ts`) |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0+ (Tested on Node.js v24.x)
- **npm**: v9.0+

### 1. Clone & Install
```bash
git clone https://github.com/ABHISHEK-DBZ/kc.git
cd kc
npm install
```

### 2. Environment Configuration
Create or configure your `.env` file:
```env
PORT=3001
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Optional: Server-Side Groq AI Reasoning
GROQ_API_KEY=gsk_...

# Optional: Supabase Cloud Database Integration
SUPABASE_URL=https://zyobbtldnabwucbwhbuo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
```
*(If Groq or Supabase keys are omitted, the platform runs in resilient offline fallback mode with SQLite).*

### 3. Seed Database
```bash
npm run seed
```
Creates `data/khatacopilot.db` with stores, 30-day sales histories, inventory runway metrics, Udhaar records, and demo accounts.

### 4. Start Development Server
```bash
npm run dev
```
Concurrently starts:
- **Express Backend Server:** `http://localhost:3001`
- **Vite Frontend Client:** `http://localhost:5173`

---

## 🧪 Testing & Validation Suites

The platform includes comprehensive automated test suites:

### 1. Smart Reorder Intelligence Test Suite
```bash
npm run test:recommendations
```
Validates all 6 realistic retail scenarios:
- **Scenario 1**: High sales growth (+18%) + low stock $\rightarrow$ `BUY_MORE` / `URGENT_REORDER`
- **Scenario 2**: Low sales velocity + large stock $\rightarrow$ `DO_NOT_BUY` / `OVERSTOCK_RISK` (Quantity strictly 0)
- **Scenario 3**: Stable sales + comfortable stock $\rightarrow$ `WAIT`
- **Scenario 4**: Runway $\le$ Lead time with demand spike $\rightarrow$ `URGENT_REORDER`
- **Scenario 5**: High margin + positive demand growth $\rightarrow$ `HIGH PROFIT OPPORTUNITY`
- **Scenario 6**: 160-day coverage + declining trend $\rightarrow$ `SLOW_MOVING` / `DO_NOT_BUY`
- Real DB persistence, non-fabrication of metrics, RBAC scoping, and PO draft generation.

### 2. Autonomous Multi-Agent Forensic Audit
```bash
npm run test:agents
```
Executes 9 forensic verification checks proving browser-closed autonomy, idempotency, event cascading, and zero client-side secret leaks.

### 3. Full End-to-End Acceptance Suite
```bash
npm run test:e2e
```
Validates all 22 end-to-end integration flows across authentication, role scoping, agent execution, PO approvals, GST reports, CSV export, and audit trails.

### 4. Production Typecheck & Build
```bash
npm run build
```
Executes `tsc -b && vite build` ensuring 100% type safety and optimized client bundles.

---

## 📂 Project Structure

```
kc/
├── android/                      # Flutter Android mobile companion app
├── data/                         # SQLite database storage (git-ignored)
├── server/
│   ├── db/
│   │   ├── database.ts           # SQLite connection with WAL mode
│   │   ├── schema.sql            # 24 normalized tables with foreign keys & indexes
│   │   └── seed.ts               # Deterministic seed data script
│   ├── middleware/
│   │   └── auth.ts               # JWT verification & territorial RBAC
│   ├── routes/
│   │   ├── agents.ts             # Agent run triggers, findings, tasks
│   │   ├── analytics.ts          # Overview KPIs & sales history
│   │   ├── auditLogs.ts          # Immutable audit trail
│   │   ├── auth.ts               # Login, logout, session verification
│   │   ├── community.ts          # Franchise community & issue resolution
│   │   ├── operations.ts         # Inventory recommendations & PO drafts
│   │   ├── purchaseOrders.ts     # PO drafting, approvals, and rejections
│   │   ├── realtime.ts           # Server-Sent Events (/api/realtime)
│   │   ├── reports.ts            # GST draft & CSV export streaming
│   │   ├── search.ts             # Global scoped search
│   │   ├── shops.ts              # Store catalog & CRM endpoints
│   │   └── supabase.ts           # Supabase connection status, test & sync
│   ├── services/
│   │   ├── agentOrchestrator.ts  # Autonomous multi-agent scheduler & engine
│   │   ├── groqService.ts        # Server-side Groq LLaMA integration
│   │   ├── inventoryRecommendationEngine.ts # Smart Reorder Intelligence Engine
│   │   ├── realtimeHub.ts        # Scoped SSE event distributor
│   │   └── supabaseService.ts    # Supabase cloud synchronization service
│   └── index.ts                  # Express server entry point (Port 3001)
├── src/
│   ├── components/               # Header, Sidebar, Global Search, Modals
│   ├── services/
│   │   ├── api.ts                # Authenticated client API layer
│   │   └── realtime.ts           # Client-side SSE EventSource listener
│   ├── views/
│   │   ├── agents/               # 8 Dedicated Agent Workspaces
│   │   ├── community/            # Franchise Community & Issue Resolution
│   │   ├── InventoryView.tsx     # Smart Reorder UI & transparent math drawer
│   │   ├── LoginView.tsx         # Apple HIG login interface
│   │   ├── OverviewView.tsx      # Enterprise Command Center dashboard
│   │   ├── PurchaseOrdersView.tsx# Human-in-the-loop PO approval queue
│   │   └── ...                   # Shops, Sales, Udhaar, Reports
│   ├── App.tsx                   # Central router & state coordinator
│   └── styles/apple-theme.css    # Apple HIG design tokens
├── supabase/
│   └── migrations/               # PostgreSQL schema for Supabase
├── audit_verifier.ts             # Forensic agent verification test suite
├── test_e2e_full.ts              # 22-step full acceptance test suite
├── test_smart_reorder.ts         # Smart reorder intelligence test suite
└── vite.config.ts                # Reverse proxy configuration
```

---

## 🔒 Security & Compliance

- **Zero Client-Side Secrets:** Groq and Supabase service keys are restricted to the Node.js backend. Automated bundle scanning verifies zero keys exist in client assets.
- **Strict Human Approval:** The Autonomous Inventory Agent generates Purchase Orders in `'Awaiting Approval'` status; no financial order is ever silently placed without human sign-off.
- **Deterministic Math:** LLMs never calculate inventory numbers or financial figures; deterministic algorithms handle all numerical logic, while AI provides explanations.
- **Regulatory GST Disclaimers:** All GST draft reports clearly state:  
  *`"DRAFT / DEMO — requires verification before filing."`*
- **Immutable Audit Trail:** All critical operations write structured JSON records with actor details and timestamps to `audit_logs`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
<sub>Built with precision for enterprise retail operations. KhataCopilot HQ &copy; 2026.</sub>
</div>
