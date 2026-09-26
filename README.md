# KhataCopilot HQ — Enterprise Multi-Agent Retail Operations Platform

KhataCopilot HQ is an authenticated, real-time, multi-agent retail platform connecting enterprise headquarters, IT operations, regional area managers, franchise owners, and store managers into a centralized autonomous operational network.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your `GROQ_API_KEY=gsk_...` to enable live Groq LLaMA reasoning)*

### 3. Initialize & Seed Database
```bash
npm run seed
```
Creates normalized SQLite database at `data/khatacopilot.db` with 15 retail branches, 30 days of transactional history, predictive inventory, udhaar credit books, and 8 AI retail agents.

### 4. Run Full-Stack Development
```bash
npm run dev
```
Starts both Express API Server (`http://localhost:3001`) and Vite Frontend (`http://localhost:5173`).

---

## 🔐 Seeded Enterprise Demo Accounts

All demo accounts are pre-configured with the secure demo password:
`DemoPass2026!`

| Persona | Demo Email | Role Scope & Authorized Boundaries |
| :--- | :--- | :--- |
| **HQ Owner** | `hq.owner@demo.khatacopilot.com` | **Global Network**: All 15 stores, all regions (West, North, South), full financial control, agent orchestration, approvals |
| **HQ IT Support** | `hq.it@demo.khatacopilot.com` | **Technical Operations**: Diagnostics, Support Agent, Community bug catalog, system health, read-only branch inspection |
| **Area Manager** | `area.manager@demo.khatacopilot.com` | **West Region (Maharashtra)**: Only Pune, Mumbai, Nashik, Thane, Nagpur stores (10 stores) |
| **Franchise Owner**| `franchise.owner@demo.khatacopilot.com` | **Patel Retail Network**: Only assigned franchise stores (3 stores) |
| **Store Manager** | `store.manager@demo.khatacopilot.com` | **Single Counter Store**: Exclusively Sharma General Store (Kothrud, Pune) |

*(Note: The login page includes a **1-Click Quick Selector** for seamless evaluation of all 5 roles).*

---

## 🤖 The 8 Autonomous AI Retail Agents

1. **Sales Intelligence Agent (`/agents/sales`)**: Analyzes category mix, margin compression, and sales velocity shifts.
2. **Autonomous Inventory Agent (`/agents/inventory`)**: Computes burn rate and stockout runway; generates automated Purchase Order drafts.
3. **Udhaar Risk & Recovery Agent (`/agents/udhaar-risk`)**: Monitors debt aging past 45/60 days and drafts automated WhatsApp repayment reminders.
4. **Revenue Anomaly Agent (`/agents/revenue-anomaly`)**: Detects sharp 7-day revenue drops against rolling baselines.
5. **Cash Reconciliation Agent (`/agents/cash-risk`)**: Flags physical register discrepancies and cashier shift shortages.
6. **Shop Health Index Agent (`/agents/shop-health`)**: Continuously calculates 5-factor operational health scores (0-100).
7. **Franchise Retention Agent (`/agents/retention`)**: Predicts branch distress signals and schedules priority field interventions.
8. **Support & Community Agent (`/agents/support`)**: Performs Groq AI issue classification and automated matching against verified known bugs (`BUG-1821`, `BUG-1904`).

---

## 🛡️ Enterprise Security & Scoping

- **Database-Level Authorization**: Enforced on the server and SQLite layer. Direct API or URL manipulation outside a user's role or territory is rejected with `403 Forbidden`.
- **Real-Time SSE Event Stream (`/api/realtime`)**: Broadcasts transactions, PO drafts, approvals, and anomalies live with territorial filtering.
- **Server-Side Groq AI Reasoning**: LLM keys remain strictly on the backend; business calculations (sums, margins, velocities) are deterministic.
- **Immutable Audit Trail (`/api/audit-logs`)**: Records every critical operational and human approval action.
