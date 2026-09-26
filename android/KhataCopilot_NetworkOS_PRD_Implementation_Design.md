# KhataCopilot NetworkOS
## Product Requirements + Implementation Design

**Document status:** Build-ready MVP specification  
**Product:** KhataCopilot NetworkOS  
**Primary surface:** Franchise mobile app + HQ web CRM/control tower  
**Primary problem:** Managing a distributed franchise/store network creates fragmented support, onboarding, customer issues, feature requests, payments, and operational work.  
**Core thesis:** Every operational event or user question should become a structured, traceable workflow that can be detected, categorized, routed, resolved, verified, and converted into reusable network knowledge.

---

# 1. Product Definition

## 1.1 Product statement

**KhataCopilot NetworkOS** is an operational CRM and community platform for a distributed network of kirana/franchise businesses. It combines franchise CRM, community support, operational signals, specialized AI agents, knowledge management, and human approval into one closed-loop system.

This is **not** a chatbot-first product. The AI layer exists to operate and improve workflows:

```text
STORE / FRANCHISE DATA
        ↓
EVENT + QUERY INGESTION
        ↓
UNDERSTAND + CATEGORIZE
        ↓
KNOWLEDGE / SIMILARITY SEARCH
        ↓
ROUTE TO BEST RESOLVER
        ↓
AI SUGGESTION / HUMAN ACTION
        ↓
RESOLUTION VERIFICATION
        ↓
KNOWLEDGE EXTRACTION
        ↓
NETWORK INTELLIGENCE
```

## 1.2 Primary user types

### HQ Admin
Owns the entire franchise network.

Needs:
- network health
- franchise performance
- support escalations
- revenue visibility
- AI agent activity
- product issue radar
- community moderation
- feature request intelligence

### Regional Manager
Owns a geographic region.

Needs:
- regional franchise health
- unresolved issues
- local escalations
- franchise onboarding
- regional community activity

### Franchise Owner
Owns one or more stores.

Needs:
- business overview
- sales/ledger visibility from KhataCopilot
- support
- community questions
- onboarding status
- subscription/payment status
- recommended actions

### Franchise Staff
Uses KhataCopilot and creates support/community queries.

Needs:
- quick troubleshooting
- knowledge articles
- ask-question flow
- assigned support tickets

### Community Expert
A verified franchise user who frequently resolves issues.

Needs:
- recommended questions to answer
- expertise profile
- reputation
- accepted answers

### HQ Support Agent
Resolves escalated questions/tickets.

Needs:
- queue
- evidence
- AI summaries
- previous incidents
- customer context
- resolution workflow

### Product Team
Consumes issue/feature intelligence.

Needs:
- recurring issue clusters
- affected app versions
- device/OS patterns
- feature demand
- verified root causes

---

# 2. Core Problems to Solve

## P0 — Distributed support fragmentation
Franchisees currently have to use disconnected channels such as phone calls, WhatsApp, email, direct messages, or ad-hoc support.

**System requirement:** One canonical query/ticket object with status, category, owner, evidence, resolution, and audit history.

## P0 — Repeated questions
Many users may encounter the same issue.

**System requirement:** Detect similar/duplicate questions before creating new work and surface verified prior resolutions.

## P0 — Poor routing
The nearest person is not always the right person. The HQ team is expensive and should not handle every issue.

**System requirement:** Route based on topic, expertise, region, previous resolutions, urgency, availability, and escalation policy.

## P0 — Reactive support
Support often starts only after the user complains.

**System requirement:** Detect abnormal operational signals and surface proactive issue cards.

## P1 — Knowledge loss
Solutions disappear inside conversations.

**System requirement:** Convert verified resolutions into structured, searchable knowledge.

## P1 — No network-level intelligence
HQ needs to identify common operational problems across stores.

**System requirement:** Cluster events, questions, tickets, devices, app versions, and resolutions into issue/incident groups.

## P1 — Feature requests are noisy
The same feature gets requested repeatedly.

**System requirement:** Automatically deduplicate and aggregate feature demand.

---

# 3. Product Principles

1. **Workflow first, AI second.**
2. **Every AI action is explainable and auditable.**
3. **High-risk actions require human approval.**
4. **A solved issue must become reusable knowledge.**
5. **Use deterministic rules where rules are sufficient.**
6. **Use LLMs for interpretation, extraction, summarization, and reasoning—not as the only source of truth.**
7. **Never represent an AI response as a human response.**
8. **User-generated content must be moderated and abuse-resistant.**
9. **The mobile app should optimize for 10–30 second interactions.**
10. **The HQ dashboard should optimize for triage and intervention.**

---

# 4. Product Surfaces

## 4.1 Franchise Mobile App

Primary navigation:

```text
Home | Khata | Community | Reports | More
```

Core screens:

1. Splash / Sign in
2. Home dashboard
3. Notifications
4. Community feed
5. Category browser
6. Ask a Question
7. AI analysis / duplicate detection
8. Question detail
9. Answer composer
10. My Questions
11. Community profile / reputation
12. Knowledge Base
13. Search
14. Business health
15. Customers
16. Subscription / billing
17. Settings

## 4.2 HQ Web CRM / Control Tower

Primary navigation:

```text
Dashboard
Franchises
Leads
Customers
Onboarding
Support Tickets
Community
Subscriptions
Finance
AI Agents
Issue Radar
Knowledge Base
Feature Requests
Analytics
Audit Logs
Settings
```

---

# 5. MVP Scope

The MVP should prove one complete closed loop instead of implementing every possible feature.

## Must ship

### A. Franchise CRM
- franchise records
- owner/staff records
- store status
- subscription status
- regional assignment
- business health summary

### B. Community
- create post
- auto-category
- similarity search
- answer
- accepted solution
- status tracking
- follow question
- attachments
- moderation

### C. Routing
- AI categorization
- local expert routing
- regional support routing
- HQ escalation

### D. AI agents
- Community Intake Agent
- Similarity Agent
- Routing Agent
- Answer Recommendation Agent
- Escalation Agent
- Knowledge Extraction Agent
- Issue Intelligence Agent

### E. Knowledge Base
- articles
- solved question conversion
- search
- related issues
- version/device metadata

### F. HQ dashboard
- network health
- open queries
- escalations
- agent activity
- issue clusters
- community activity

## Post-MVP

- advanced proactive anomaly detection
- regional automation
- payment collection automation
- advanced churn prediction
- full campaign automation
- omnichannel messaging
- franchise benchmarking
- mobile push automations
- advanced workforce/reputation controls

---

# 6. Core User Journey

## 6.1 User asks a question

Example:

> “My voice entry is recording, but the amount is being detected incorrectly.”

### Expected journey

```text
Community
  ↓
Ask a Question
  ↓
Enter issue + optional media
  ↓
AI analyzes
  ↓
Auto-category = Voice Entry
  ↓
Search similar questions
  ↓
Show 3 likely solved questions
  ↓
User chooses:
  ├─ Use existing solution
  └─ Post anyway
  ↓
Create Query #QC-8421
  ↓
Route to resolver
  ↓
Notify matched expert
  ↓
If unresolved → regional
  ↓
If unresolved → HQ
  ↓
Resolution submitted
  ↓
User confirms solved
  ↓
Knowledge Agent creates draft article
  ↓
Article approved/published
```

---

# 7. Community Product Design

## 7.1 Community home

### Header
- page title: Community
- subtitle: Learn • Solve • Grow Together
- search bar
- notifications
- Ask a Question CTA

### Tabs

```text
All | Unanswered | Solved | Following | My Questions | Announcements
```

### Category chips

```text
All Topics
Getting Started
Voice Entry
Khata / Ledger
Inventory
GST & Tax
UPI & Payments
Reports
Device Setup
Troubleshooting
Business Growth
Feature Requests
```

### Post card fields

- avatar
- user name
- franchise ID
- region/city if permitted
- timestamp
- category
- title
- body preview
- attachments
- AI classification badge
- status
- answer count
- helpful count
- follow button

### Example

```text
GST & Tax                          Unanswered

How can I generate my GSTR-1 report?

Rajesh Sharma • FR-1028 • 2h ago

I entered all sales and purchases but...

AI Category: GST & Tax · 94% confidence

💬 12    👍 4    Follow
```

---

# 8. Ask a Question UX

## Screen state A — Compose

Fields:
- title / question
- detailed description
- optional attachment(s)
- optional product module
- priority

The category should be **AI detected by default**.

Do not force the user to understand internal taxonomy.

### CTA

`Post Question`

## Screen state B — Analyze

Display:

```text
Analyzing your question…

✓ Detecting issue
✓ Finding category
✓ Searching similar questions
✓ Finding relevant experts
```

## Screen state C — Similar questions

```text
We found 3 similar solved questions.

1. Voice entry not working on Android 14
2. Amount recognized incorrectly
3. Voice entries stop after 2–3 seconds

[View Solution]
[Continue & Post Anyway]
```

## Screen state D — Posted

```text
Question #QC-8421

✓ Categorized
✓ Finding similar cases
✓ Notifying relevant experts
○ Escalation available if needed
```

---

# 9. Question State Machine

```text
DRAFT
  ↓
POSTED
  ↓
CLASSIFIED
  ↓
ROUTED
  ↓
ACKNOWLEDGED
  ↓
IN_PROGRESS
  ├───────────────┐
  ↓               ↓
ANSWERED       ESCALATED
  ↓               ↓
USER_REVIEW       HQ_REVIEW
  ↓               ↓
SOLVED         RESOLVED
  ↓               ↓
KNOWLEDGE_READY
  ↓
CLOSED
```

Additional states:
- DUPLICATE
- MODERATED
- REOPENED
- SPAM

---

# 10. Routing Logic

## Routing priority

The system should not simply route by nearest location.

Score each candidate resolver using:

```text
Resolver Score =
  Topic Expertise
+ Historical Resolution Success
+ Region Relevance
+ Product/Version Relevance
+ Availability
+ Current Queue Load
- Escalation Penalty
```

Use a weighted deterministic score for MVP.

### Example

```text
Question:
Inventory opening stock configuration

Candidate A
Topic expertise: 0.95
Past successful resolutions: 0.92
Region: 0.80
Queue load: 0.60

Candidate B
Topic expertise: 0.87
Past successful resolutions: 0.71
Region: 0.98
Queue load: 0.95

Candidate B → assigned
```

The exact score is an internal routing signal, not a user-facing “quality rating”.

---

# 11. Escalation Policy

Default configurable SLA policy:

```text
0–30 min
      ↓
Community Expert / Local Franchise

30–60 min
      ↓
Regional Support

60+ min or High priority
      ↓
HQ Support

Critical / incident cluster
      ↓
Product / Engineering
```

Do not hardcode these times. Store them as tenant settings.

### Escalation triggers

- no response
- low confidence AI answer
- high severity
- many similar incidents
- financial impact
- security/privacy concern
- repeated reopen

---

# 12. AI Agent Architecture

## Agent Orchestrator

Use one orchestration layer to dispatch specialized agents.

```text
                 Event / Query
                       ↓
                ORCHESTRATOR
                       ↓
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
     Intake       Similarity       Routing
        ↓              ↓              ↓
     Answer         Incident       Escalation
     Agent           Agent           Agent
        └──────────────┼──────────────┘
                       ↓
                Resolution Agent
                       ↓
                Knowledge Agent
                       ↓
             Insights / Issue Agent
```

## 12.1 Community Intake Agent

Responsibilities:
- classify intent
- detect category/subcategory
- extract entities
- infer urgency
- normalize text
- identify product module
- extract device/OS/app version from text

Output example:

```json
{
  "category": "voice_entry",
  "subcategory": "amount_recognition",
  "priority": "medium",
  "entities": {
    "os": "Android 14"
  },
  "confidence": 0.94
}
```

## 12.2 Similarity Agent

Responsibilities:
- semantic search against solved questions
- semantic search against knowledge articles
- detect duplicate questions
- surface related incidents

Use vector similarity plus deterministic filters:

```text
same module
same app version
same OS
same device family
same symptom keywords
```

## 12.3 Routing Agent

Responsibilities:
- choose resolver queue
- choose community expert
- choose regional team
- choose HQ
- provide routing reason

## 12.4 Answer Recommendation Agent

Uses:
- approved knowledge base
- accepted community answers
- product docs
- known incidents

Never fabricate official policy. If confidence is low, escalate.

## 12.5 Escalation Agent

Responsibilities:
- monitor SLA
- monitor severity
- trigger escalation
- summarize context for next resolver

## 12.6 Resolution Agent

Responsibilities:
- capture final resolution
- request confirmation
- detect reopen
- calculate resolution duration

## 12.7 Knowledge Extraction Agent

On solved case:

```text
Conversation
   ↓
Extract problem
   ↓
Extract root cause
   ↓
Extract fix
   ↓
Extract affected versions
   ↓
Extract affected devices
   ↓
Create draft knowledge article
   ↓
Human approval (recommended for publish)
```

## 12.8 Issue Intelligence Agent

Groups many tickets/questions into a probable incident.

Example:

```text
84 questions
+ 31 tickets
+ 4 app-version clusters
+ same device family
        ↓
Possible shared issue cluster
```

---

# 13. AI Safety / Grounding Rules

1. Only use approved sources for official product instructions.
2. Show source references inside internal support views.
3. Mark generated content as AI-generated until approved.
4. Never silently change financial or account state.
5. Require human approval for refunds, plan changes, destructive actions, and sensitive communications.
6. Log prompt/version/model/tool/action metadata for every agent run.
7. Prevent prompt injection from user content from changing system permissions.
8. Redact secrets and unnecessary personal data before model calls.
9. Keep deterministic checks around all critical workflows.

---

# 14. Proactive Issue Detection

This is the major differentiation layer.

## Event sources

From KhataCopilot itself:
- transaction count
- voice-entry count
- inventory sync result
- report generation failures
- login activity
- app version
- device model
- operating system
- API errors
- sync latency
- payment failures

From CRM/community:
- support tickets
- community posts
- feature requests
- repeated user complaints

## Example rule

```text
IF
  daily_voice_entries < 40% of 14-day baseline
AND
  error_rate > threshold
AND
  affected_users >= minimum
THEN
  create PROACTIVE_ISSUE_ALERT
```

The MVP can use statistical thresholds before adding a trained ML anomaly detector.

---

# 15. Issue Radar

HQ screen showing:

```text
ISSUE RADAR

Voice Entry
↑ 37%
84 stores affected

GST Sync
↑ 21%
41 stores affected

Inventory Sync
↑ 8%
18 stores affected

UPI
Normal
```

Clicking an issue should open:

- incident cluster
- affected franchises
- affected versions
- devices/OS
- first seen
- latest seen
- similar historical incidents
- likely root cause
- evidence
- assigned owner
- status

---

# 16. Knowledge Base

## Article model

```text
Title
Summary
Problem
Symptoms
Cause
Resolution
Applicable Module
App Version Range
OS
Device Notes
Evidence
Source Cases
Approved By
Published At
Last Reviewed At
```

## Search strategy

Hybrid search:

```text
Keyword Search
+
Vector Search
+
Metadata Filters
+
Popularity / resolution success
```

## Article lifecycle

```text
DRAFT
 ↓
AI_GENERATED
 ↓
HUMAN_REVIEW
 ↓
PUBLISHED
 ↓
REVIEW_DUE
 ↓
ARCHIVED
```

---

# 17. Feature Requests

Feature requests should be treated as structured product intelligence.

Example:

```text
User A: “Please add barcode scanner.”
User B: “Need barcode scanning.”
User C: “Barcode scanner for inventory.”
```

AI should cluster them into:

```text
Feature:
Barcode Scanner

Requests:
18

Unique franchises:
14

Regions:
5

Module:
Inventory

Status:
Under Review
```

Track:
- request count
- unique franchise count
- votes
- customer plan tier
- business impact
- product status

---

# 18. Reputation / Community Expertise

Do not create a simple popularity system.

Use measurable contribution signals:

```text
Accepted solutions
Helpful votes
Resolution success
Response quality
Topic-specific experience
Moderation history
```

Example profile:

```text
Rajesh Sharma
FR-1028 · Mumbai

Verified Community Expert

GST & Tax         92% expertise signal
Inventory         81%
Voice Entry       63%

Accepted solutions: 47
Helpful answers: 126
```

The “expertise signal” is internal and should not be presented as a guarantee of correctness.

---

# 19. Franchise CRM

## Franchise details

```text
Franchise ID
Business Name
Owner
Region
City
Store Count
Plan
Subscription Status
Onboarding Stage
Account Health
Last Active
Support Open
Community Activity
```

## Franchise detail page

Tabs:

```text
Overview
Activity
Customers
Support
Community
Subscription
Usage
Agents
Notes
```

### Business health

Aggregate from:
- usage trend
- unresolved support
- payment status
- activity
- operational errors
- onboarding completion

Avoid one opaque “AI score” without explainability.

---

# 20. HQ Dashboard

## KPI cards

```text
Total Franchises
Active Stores
Monthly Revenue
Open Tickets
Community Activity
```

## Main panels

### Franchise Distribution
Map + regional counts.

### Franchise Health
Healthy / Needs Attention / At Risk / Inactive.

### Revenue Trend
Historical and selected period.

### AI Agent Activity
Recent agent actions with drill-down.

### Franchises Needing Attention
Top unresolved/high-impact accounts.

### Top Community Topics
By volume and change over time.

### Issue Radar
Emerging cross-network problems.

---

# 21. Mobile App Screen Inventory

| Screen | Purpose | Priority |
|---|---|---|
| Splash | brand + startup | P0 |
| Login | authentication | P0 |
| Home | business snapshot | P0 |
| Community | browse discussions | P0 |
| Ask Question | create issue | P0 |
| Analyze Question | AI triage | P0 |
| Question Detail | follow/responses | P0 |
| My Questions | own support history | P0 |
| Knowledge Base | self-service resolution | P0 |
| Notifications | updates/escalations | P0 |
| Profile | identity/reputation | P1 |
| Reports | business reporting | P1 |
| Subscription | plan/billing | P1 |
| Settings | configuration | P0 |

---

# 22. Web CRM Screen Inventory

| Screen | Purpose | Priority |
|---|---|---|
| Dashboard | HQ control tower | P0 |
| Franchises | account management | P0 |
| Leads | acquisition pipeline | P1 |
| Onboarding | rollout | P0 |
| Support Tickets | service operations | P0 |
| Community | moderation/routing | P0 |
| AI Agents | monitoring | P0 |
| Issue Radar | network incidents | P0 |
| Knowledge Base | content | P0 |
| Feature Requests | product demand | P1 |
| Finance | billing | P1 |
| Analytics | trends | P1 |
| Audit Logs | governance | P0 |
| Settings | policies | P0 |

---

# 23. Recommended Technical Stack

## Frontend — mobile

**Flutter** for Android/iOS to reuse an existing mobile application direction and maintain one codebase.

Recommended packages / patterns:
- Riverpod or Bloc for state management
- GoRouter for navigation
- Dio for API networking
- freezed/json_serializable for typed models
- Firebase Cloud Messaging for push
- secure storage for tokens

## Frontend — HQ CRM

**Next.js + TypeScript + Tailwind + component library**.

Use a reusable design system rather than generating one-off pages.

## Backend

**FastAPI + Python**.

Services:
- auth
- CRM
- community
- routing
- agents
- knowledge
- notifications
- analytics

## Database

**PostgreSQL / Supabase**.

Use:
- relational tables for transactional data
- Row Level Security where applicable
- Postgres full-text search
- pgvector for semantic retrieval

## Queue / background work

Redis + worker system or Supabase/managed queue equivalent.

Jobs:
- embedding generation
- notifications
- SLA checks
- agent runs
- incident clustering
- knowledge extraction

## Object storage

Supabase Storage or S3-compatible storage for attachments.

## AI

Model provider abstraction:

```text
AI Gateway
 ├── Primary LLM
 ├── Fast/cheap classifier model
 ├── Embedding model
 └── Optional local model
```

Do not couple the application to a single model vendor.

---

# 24. Backend Architecture

```text
                   MOBILE APP
                       │
                   WEB CRM
                       │
                       ↓
                 API GATEWAY
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
     AUTH            CRM API         COMMUNITY API
       │               │                │
       └───────────────┼────────────────┘
                       ↓
                 DOMAIN SERVICES
                       │
       ┌───────────────┼──────────────────────┐
       ↓               ↓                      ↓
   WORKFLOW         AGENT ORCH.          EVENT ENGINE
       │               │                      │
       └───────────────┼──────────────────────┘
                       ↓
                  POSTGRES/PGVECTOR
                       │
                KNOWLEDGE + AUDIT
```

---

# 25. Database Design

## 25.1 Core identity

### users

```sql
id uuid pk
name text
email text
phone text
role text
status text
avatar_url text
created_at timestamptz
updated_at timestamptz
```

### organizations

For future multi-tenant support.

```sql
id uuid pk
name text
status text
created_at timestamptz
```

### franchises

```sql
id uuid pk
organization_id uuid fk
franchise_code text unique
business_name text
owner_user_id uuid fk
region_id uuid fk
city text
state text
country text
status text
plan_id uuid fk
health_status text
joined_at timestamptz
created_at timestamptz
updated_at timestamptz
```

### franchise_members

```sql
id uuid pk
franchise_id uuid fk
user_id uuid fk
role text
status text
joined_at timestamptz
```

---

## 25.2 Community

### community_posts

```sql
id uuid pk
franchise_id uuid fk
author_user_id uuid fk
title text
body text
category_id uuid fk
subcategory text
priority text
status text
ai_confidence numeric
accepted_answer_id uuid nullable
created_at timestamptz
updated_at timestamptz
closed_at timestamptz
```

### community_post_tags

```sql
post_id uuid fk
tag_id uuid fk
primary key(post_id, tag_id)
```

### community_answers

```sql
id uuid pk
post_id uuid fk
author_user_id uuid fk
body text
source_type text
is_ai_generated boolean
ais_accepted boolean
helpful_count integer
author_confidence numeric nullable
created_at timestamptz
updated_at timestamptz
```

### post_follows

```sql
post_id uuid fk
user_id uuid fk
created_at timestamptz
primary key(post_id, user_id)
```

### post_attachments

```sql
id uuid pk
post_id uuid fk
storage_path text
mime_type text
size_bytes bigint
created_at timestamptz
```

---

## 25.3 Support / workflow

### support_tickets

```sql
id uuid pk
source_type text
source_id uuid
franchise_id uuid fk
customer_id uuid nullable
category_id uuid fk
priority text
status text
assigned_team_id uuid nullable
assigned_user_id uuid nullable
sla_due_at timestamptz nullable
created_at timestamptz
updated_at timestamptz
resolved_at timestamptz nullable
```

### ticket_events

```sql
id uuid pk
ticket_id uuid fk
event_type text
actor_type text
actor_id uuid nullable
payload jsonb
created_at timestamptz
```

---

# 26. AI Agent Data Model

### agents

```sql
id uuid pk
name text
agent_type text
version text
status text
configuration jsonb
created_at timestamptz
```

### agent_runs

```sql
id uuid pk
agent_id uuid fk
trigger_type text
trigger_source text
source_id uuid nullable
status text
model_name text
prompt_version text
input_summary jsonb
output_summary jsonb
confidence numeric nullable
started_at timestamptz
completed_at timestamptz
error text nullable
```

### agent_actions

```sql
id uuid pk
agent_run_id uuid fk
action_type text
risk_level text
requires_approval boolean
approval_status text
input jsonb
result jsonb
created_at timestamptz
executed_at timestamptz nullable
```

### agent_approvals

```sql
id uuid pk
agent_action_id uuid fk
approved_by uuid fk
decision text
comment text
created_at timestamptz
```

---

# 27. Knowledge / Search Data Model

### knowledge_articles

```sql
id uuid pk
title text
summary text
content text
category_id uuid fk
status text
source_type text
source_id uuid nullable
approved_by uuid nullable
version_range text nullable
os text nullable
device_family text nullable
published_at timestamptz nullable
last_reviewed_at timestamptz nullable
created_at timestamptz
updated_at timestamptz
```

### knowledge_embeddings

```sql
id uuid pk
article_id uuid fk
chunk_index integer
content text
embedding vector
metadata jsonb
created_at timestamptz
```

### question_embeddings

```sql
id uuid pk
post_id uuid fk
embedding vector
metadata jsonb
created_at timestamptz
```

---

# 28. Incident Intelligence Data Model

### issue_clusters

```sql
id uuid pk
title text
category_id uuid fk
severity text
status text
first_seen_at timestamptz
last_seen_at timestamptz
affected_franchise_count integer
affected_user_count integer
probable_root_cause text nullable
confidence numeric nullable
created_at timestamptz
updated_at timestamptz
```

### issue_cluster_members

```sql
id uuid pk
issue_cluster_id uuid fk
source_type text
source_id uuid
similarity_score numeric
created_at timestamptz
```

---

# 29. CRM Event Model

All important product events should be normalized.

```json
{
  "event_id": "evt_123",
  "event_type": "voice_entry_failed",
  "franchise_id": "fr_1028",
  "user_id": "usr_42",
  "occurred_at": "2026-09-26T10:10:00Z",
  "properties": {
    "app_version": "4.2.0",
    "os": "Android 14",
    "module": "voice_entry",
    "error_code": "VOICE_PARSE_014"
  }
}
```

Canonical event categories:
- user_activity
- transaction
- voice_entry
- sync
- inventory
- report
- payment
- login
- support
- community
- subscription
- app_error

---

# 30. API Design

## Auth

```http
POST /v1/auth/login
POST /v1/auth/refresh
POST /v1/auth/logout
GET  /v1/me
```

## Franchise

```http
GET  /v1/franchises
POST /v1/franchises
GET  /v1/franchises/:id
PATCH /v1/franchises/:id
GET  /v1/franchises/:id/activity
GET  /v1/franchises/:id/health
```

## Community

```http
GET  /v1/community/posts
POST /v1/community/posts
GET  /v1/community/posts/:id
POST /v1/community/posts/:id/answers
POST /v1/community/posts/:id/follow
POST /v1/community/posts/:id/accept-answer
POST /v1/community/posts/:id/reopen
```

## AI analysis

```http
POST /v1/community/posts/:id/analyze
GET  /v1/community/posts/:id/similar
GET  /v1/community/posts/:id/recommendations
```

## Support

```http
GET  /v1/tickets
POST /v1/tickets
GET  /v1/tickets/:id
POST /v1/tickets/:id/assign
POST /v1/tickets/:id/escalate
POST /v1/tickets/:id/resolve
```

## Knowledge

```http
GET  /v1/knowledge/search?q=...
GET  /v1/knowledge/:id
POST /v1/knowledge
POST /v1/knowledge/:id/approve
PATCH /v1/knowledge/:id
```

## Agents

```http
GET  /v1/agents
GET  /v1/agents/runs
GET  /v1/agents/runs/:id
GET  /v1/agents/actions/pending
POST /v1/agents/actions/:id/approve
POST /v1/agents/actions/:id/reject
```

## Issue Radar

```http
GET  /v1/issues
GET  /v1/issues/:id
GET  /v1/issues/:id/evidence
POST /v1/issues/:id/assign
POST /v1/issues/:id/resolve
```

---

# 31. API Example — Ask Question

### Request

```json
POST /v1/community/posts

{
  "title": "Voice entry amount is incorrect",
  "body": "Voice recording works but 1500 is being detected as 15000.",
  "attachments": [],
  "priority": "normal"
}
```

### Response

```json
{
  "post_id": "QC-8421",
  "status": "ANALYZING",
  "next": "/v1/community/posts/QC-8421"
}
```

### Async agent output

```json
{
  "category": "voice_entry",
  "subcategory": "amount_recognition",
  "priority": "medium",
  "confidence": 0.94,
  "similar_posts": [
    {"id": "QC-8112", "score": 0.92},
    {"id": "QC-8043", "score": 0.88}
  ],
  "routing": {
    "type": "community_expert",
    "user_id": "usr_77"
  }
}
```

---

# 32. Notification System

Channels:

```text
In-app
Push
Email
SMS/WhatsApp (optional, policy controlled)
```

Notification events:
- answer received
- accepted solution
- question escalated
- agent found similar issue
- franchise onboarding step due
- payment reminder
- incident alert
- feature request status changed

Notification priority:

```text
INFO
IMPORTANT
URGENT
CRITICAL
```

---

# 33. RBAC / Permissions

## Roles

```text
SUPER_ADMIN
HQ_ADMIN
REGIONAL_MANAGER
HQ_SUPPORT
PRODUCT_MANAGER
FRANCHISE_OWNER
FRANCHISE_STAFF
COMMUNITY_EXPERT
```

## Example permissions

| Action | HQ Admin | Regional | Owner | Staff |
|---|---:|---:|---:|---:|
| View network | ✓ | region only | ✗ | ✗ |
| View franchise | ✓ | ✓ | own only | own only |
| Create community post | ✓ | ✓ | ✓ | ✓ |
| Answer community | ✓ | ✓ | ✓ | ✓ |
| Moderate | ✓ | region | ✗ | ✗ |
| Resolve HQ ticket | ✓ | limited | ✗ | ✗ |
| Approve AI action | ✓ | selected | ✗ | ✗ |
| Publish knowledge | ✓ | selected | ✗ | ✗ |
| View audit logs | ✓ | limited | own activity | own activity |

Use server-side authorization. Never trust client-side role checks.

---

# 34. Security Requirements

## Authentication
- short-lived access tokens
- refresh-token rotation
- device/session management
- optional MFA for HQ roles

## Authorization
- RBAC
- organization/tenant isolation
- franchise-level data scoping
- server-side policy enforcement

## Data
- encryption in transit
- encryption at rest through managed infrastructure
- secure object storage
- signed attachment URLs
- secret management

## AI-specific
- prompt injection filtering
- tool allowlists
- action permissions
- input/output logging
- PII minimization
- no secret values in prompts

## Audit
Log:
- login
- role change
- ticket assignment
- moderation
- AI action
- approval
- financial action
- data export
- knowledge publication

---

# 35. Moderation and Community Safety

User content can contain:
- spam
- abusive content
- personal information
- false business instructions
- unsafe advice

MVP moderation pipeline:

```text
Post Created
   ↓
Basic validation
   ↓
Automated moderation
   ↓
Publish / Queue
   ↓
Human moderator if needed
```

Support a report button:

```text
Report Spam
Report Abuse
Report Wrong Information
Report Personal Information
```

---

# 36. Observability

## Application
- request logs
- error logs
- latency
- uptime
- queue depth
- failed jobs

## AI
- agent success rate
- tool errors
- model latency
- token usage
- retrieval quality
- confidence distribution
- human override rate

## Product
- question creation rate
- first-response time
- median time to resolution
- escalation rate
- reopen rate
- repeat-question rate
- accepted-answer rate
- knowledge reuse rate

---

# 37. Key Product Metrics

## Community

### Time to first useful response
Time from post creation to first response that the user marks helpful/accepted or that support marks as valid.

### Resolution time
Time from question creation to confirmed resolution.

### Self-service rate

```text
resolved through prior knowledge / total resolved questions
```

### Peer-resolution rate

```text
resolved by community / total resolved questions
```

### HQ escalation rate

```text
HQ escalated / total questions
```

### Knowledge reuse rate

```text
questions resolved using existing knowledge / total questions
```

---

# 38. Success Criteria for MVP

The MVP is successful when a judge can perform this end-to-end scenario without manual database edits:

```text
1. Create/login as franchise user
2. Open Community
3. Ask a real-looking product support question
4. AI categorizes it
5. AI finds similar resolved questions
6. User posts anyway
7. System routes it to a community expert
8. Expert answers
9. User accepts answer
10. HQ sees the resolved case
11. Knowledge draft is created
12. HQ approves it
13. Second user asks a similar question
14. System finds the newly approved knowledge article
15. HQ Issue Radar shows the aggregate issue trend
```

Everything above should work on a deployed environment.

---

# 39. Demo Data Strategy

For hackathon/demo use, seed realistic synthetic records.

Target dataset:

```text
1 HQ organization
8 regions
100 franchises
500 users
2,000 customers
1,000 community posts
2,500 answers
300 knowledge articles
1,500 support tickets
50 issue clusters
10,000 operational events
```

The demo dataset must clearly be labeled synthetic/test data where appropriate.

---

# 40. Seed Scenarios

Prepare these guaranteed demos:

## Scenario A — Duplicate knowledge

Question:
> “GST report showing lower sales.”

Existing knowledge:
> “Re-sync GST data after financial-year change.”

Expected:
System surfaces prior solution before new support work is created.

## Scenario B — Peer resolution

Question:
> “Voice amount recognition incorrect on Android 14.”

Expected:
Route to a verified franchise expert with relevant history.

## Scenario C — Escalation

Question:
> “UPI payment completed but ledger not updated.”

Expected:
Peer → regional → HQ based on response/SLA state.

## Scenario D — Incident detection

Many stores show the same voice issue.

Expected:
Issue Radar creates a cluster and identifies common version/device patterns.

## Scenario E — Feature demand

Many users request barcode scanning.

Expected:
Requests are clustered into one feature request with request counts.

---

# 41. Frontend Design System

## Visual direction

Use the current KhataCopilot visual language:
- light background
- deep navy typography/navigation
- clean white cards
- blue as primary action
- green for success/healthy
- orange for attention
- red for critical
- purple for AI/insights
- 12–20px radius
- subtle shadows
- dense but readable information layout

## Do not use
- generic “AI purple neon” gradients everywhere
- chat-first layout
- excessive glassmorphism
- animated widgets without operational value
- fake 3D AI robot imagery

## Mobile UX

- thumb-reachable primary actions
- sticky “Ask a Question” CTA where useful
- bottom navigation
- skeleton loading
- offline-friendly drafts
- upload progress
- accessible text sizes

## Web UX

- dense data tables
- keyboard-friendly navigation
- filters
- saved views
- bulk actions
- side drawers for record inspection
- live activity panel

---

# 42. Suggested Mobile Navigation

```text
BOTTOM NAV

Home | Khata | Community | Reports | More
```

## Community floating action

Use a single prominent FAB or header CTA:

`+ Ask`

Avoid multiple competing CTAs.

---

# 43. Suggested HQ Dashboard Layout

```text
┌───────────────────────────────────────────────────────────┐
│ Search                              Alerts       Profile   │
├───────────────┬───────────────────────────────────────────┤
│               │ KPI     KPI       KPI        KPI          │
│ Sidebar       ├───────────────────────────────────────────┤
│               │ Franchise Map    Health      Revenue     │
│ Dashboard     │                                           │
│ Franchises    ├───────────────────────────────────────────┤
│ Leads         │ AI Agent Activity      Attention Needed │
│ Onboarding    │                                           │
│ Support       ├───────────────────────────────────────────┤
│ Community     │ Issue Radar   │ Community Topics         │
│ Agents        │               │                           │
│ Issues        └───────────────────────────────────────────┘
│ Knowledge
└───────────────┴───────────────────────────────────────────┘
```

---

# 44. Build Architecture by Milestone

## Milestone 1 — Foundation

Build:
- repositories
- environments
- auth
- DB
- RBAC
- design system
- mobile shell
- web shell
- CI/CD

Deliverable:
User can sign in and see role-specific navigation.

## Milestone 2 — Franchise CRM

Build:
- franchise CRUD
- user/member management
- regions
- franchise profile
- health summary

Deliverable:
HQ can create/manage franchise records.

## Milestone 3 — Community Core

Build:
- feed
- category pages
- ask question
- answers
- accepted answer
- follow
- attachments
- moderation

Deliverable:
A functional support community without AI.

## Milestone 4 — AI Intake + Similarity

Build:
- taxonomy
- classifier
- embeddings
- similarity search
- duplicate detection
- AI suggestion panel

Deliverable:
A question gets automatically understood and matched.

## Milestone 5 — Routing + Escalation

Build:
- expertise model
- queue
- routing logic
- SLA timer
- escalations
- notifications

Deliverable:
A question automatically reaches the right person.

## Milestone 6 — Knowledge Loop

Build:
- solution extraction
- knowledge draft
- approval
- publication
- search
- evidence links

Deliverable:
Solved questions become reusable knowledge.

## Milestone 7 — Issue Radar

Build:
- event ingestion
- issue clustering
- affected stores
- version/device aggregation
- proactive alerts

Deliverable:
HQ can detect network-wide issues before support volume explodes.

## Milestone 8 — Demo hardening

Build:
- seed data
- loading/error states
- audit logs
- metrics
- deployment
- monitoring
- demo script

Deliverable:
Fully deployable hackathon build.

---

# 45. Recommended Monorepo Structure

```text
khatacopilot-networkos/
│
├── apps/
│   ├── mobile/                # Flutter app
│   └── web/                   # Next.js HQ CRM
│
├── services/
│   ├── api/                   # FastAPI
│   ├── worker/                # async jobs
│   └── ai-orchestrator/       # agent routing
│
├── packages/
│   ├── api-client/
│   ├── types/
│   ├── design-tokens/
│   └── shared-constants/
│
├── db/
│   ├── migrations/
│   ├── seed/
│   └── policies/
│
├── ai/
│   ├── prompts/
│   ├── evaluators/
│   ├── retrieval/
│   └── schemas/
│
├── docs/
│   ├── PRD.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── RUNBOOK.md
│
└── infra/
    ├── docker/
    └── deployment/
```

---

# 46. AI Implementation Pattern

Do not let the model return uncontrolled prose when structured output is required.

Use JSON schema / typed outputs.

Example:

```python
class ClassificationResult(BaseModel):
    category: str
    subcategory: str | None
    priority: Literal["low", "medium", "high", "critical"]
    confidence: float
    entities: dict[str, str]
    reasons: list[str]
```

Then validate server-side.

For actions:

```python
class ProposedAction(BaseModel):
    action_type: str
    requires_approval: bool
    reason: str
    target_id: str | None
    parameters: dict
```

The model can **propose** an action. The backend decides whether that action is allowed.

---

# 47. Retrieval Pipeline

```text
Question
 ↓
Normalize
 ↓
Extract metadata
 ↓
Exact search
 ↓
Keyword search
 ↓
Vector search
 ↓
Metadata filtering
 ↓
Reranking
 ↓
Top evidence
 ↓
Grounded answer
```

Recommended retrieval filters:
- module
- version
- device
- OS
- region
- article status = published
- source trust

---

# 48. Agent Memory Model

Use three types of memory.

## User memory
Stable, user-approved preferences / context.

## Franchise memory
Store-level context such as:
- enabled modules
- plan
- common issues
- devices
- onboarding state

## Network memory
Aggregated, reusable knowledge:
- solved issues
- issue clusters
- approved feature requests
- verified solutions

Avoid storing private conversation content indefinitely without a business purpose.

---

# 49. Human-in-the-Loop Design

### AI can execute automatically

- classification
- tagging
- routing recommendation
- duplicate detection
- draft answer
- reminder generation
- knowledge draft creation

### AI should ask for approval

- refunds
- subscription changes
- sensitive account actions
- destructive operations
- external communications with legal/financial consequences
- publishing official policy changes

The approval view should show:

```text
ACTION
WHY
EVIDENCE
EXPECTED EFFECT
RISK
[Approve] [Reject]
```

---

# 50. Quality Evaluation

## Classifier
Track:
- category accuracy
- priority accuracy
- confidence calibration

## Retrieval
Track:
- top-k recall
- duplicate detection precision
- knowledge article usefulness

## Agent
Track:
- action success rate
- human override rate
- escalation accuracy
- tool failure rate

## Community
Track:
- accepted answer rate
- repeat question reduction
- resolution time

Create a fixed evaluation set before changing prompts/models.

---

# 51. Performance Requirements

Target MVP behavior:

```text
Initial app screen:
< 2 sec on warm load

Feed API:
< 500 ms p95 without AI

Question creation:
< 800 ms API response

AI categorization:
async; UI should not block

Similarity search:
< 1 sec target

Community feed:
paginated, cursor-based
```

Use asynchronous processing for anything involving LLMs or embeddings.

---

# 52. Offline / Poor Connectivity Strategy

Because KhataCopilot serves small businesses and connectivity can vary, the mobile app should support:

- cached community feed
- draft question offline
- queued question submission
- cached knowledge articles
- retry with exponential backoff
- local notification state

Do not claim “fully offline AI community” unless the model and workflow are actually supported offline.

---

# 53. Payments / Subscription Integration

Post-MVP or P1.

Model:

```text
franchise
  ↓
plan
  ↓
subscription
  ↓
invoices
  ↓
payments
```

Payment status events should flow into the same event system so Finance and Retention agents can act on approved workflows.

Sensitive payment actions should remain human-approved during the MVP.

---

# 54. Analytics Events

Track these frontend events:

```text
community_opened
question_started
question_submitted
similar_question_viewed
solution_clicked
answer_created
answer_helpful
answer_accepted
question_followed
question_reopened
knowledge_article_opened
feature_request_voted
agent_recommendation_opened
agent_action_approved
agent_action_rejected
```

Track backend events:

```text
question_classified
similarity_completed
route_selected
sla_started
sla_breached
escalation_created
issue_cluster_created
knowledge_draft_created
knowledge_published
```

---

# 55. Acceptance Criteria

## Community

- User can create a post from mobile.
- Post receives deterministic/AI category.
- Similar questions are displayed.
- User can continue posting after seeing duplicates.
- Users can answer.
- Author can accept an answer.
- Status changes to solved.
- Question can be reopened.
- Notifications are delivered.
- Spam/report flow exists.

## Routing

- New questions enter a routing queue.
- Candidate experts are selected.
- Route reason is visible to HQ.
- SLA is tracked.
- Escalation happens automatically.

## Knowledge

- Accepted solutions can create a draft article.
- HQ can review and publish.
- Search returns the article.
- Article is linked back to source cases.

## Issue Radar

- Operational events can be ingested.
- Repeated events can form a cluster.
- HQ can inspect affected franchises.
- Cluster can be assigned and resolved.

## Audit

- AI runs are logged.
- Actions are logged.
- Approvals are logged.
- Admin changes are logged.

---

# 56. Hackathon Demo Script

## Minute 0–1: Problem

Show HQ dashboard and explain:

> As a franchise network grows, customer issues, support requests, operational problems, and product feedback become fragmented across people and channels.

## Minute 1–2: Community

Login as a franchise owner.

Post:

> “Voice entry is detecting 1500 as 15000 on Android 14.”

Show:
- AI category
- similar questions
- expert routing

## Minute 2–3: Human + AI resolution

Switch to the community expert account.

Show:
- assigned question
- AI recommended evidence
- answer
- accepted solution

## Minute 3–4: Knowledge loop

Switch to HQ.

Show:
- resolution
- AI knowledge draft
- approve/publish

Ask the same question from another user.

Show:

> Verified solution found.

## Minute 4–5: Network intelligence

Open Issue Radar.

Show multiple stores with the same issue pattern.

Explain:

> The system can move from individual support to network-level product intelligence.

---

# 57. What Makes the Product Non-Wrapper

The minimum genuine product primitives are:

### 1. Domain event system
The platform receives actual operational store events.

### 2. Franchise knowledge graph
Relationships exist between stores, users, modules, devices, issues, resolutions, and experts.

### 3. Routing engine
The system chooses who should act.

### 4. Resolution lifecycle
The system tracks whether an answer actually solved the problem.

### 5. Knowledge propagation
A verified solution can help the next franchise automatically.

### 6. Issue clustering
Independent complaints can become one operational incident.

### 7. Human approval controls
AI proposes and executes within explicit permission boundaries.

### 8. Audit trail
Every meaningful action can be reconstructed.

Without these layers, the product risks becoming a normal CRM with an LLM on top.

---

# 58. V1 Product Definition

### Name
**KhataCopilot NetworkOS**

### Tagline
**One network. Every store connected. Every problem gets smarter.**

### Core promise

> Detect the problem. Find the right resolver. Verify the solution. Teach the network.

### Primary module
**Community + Operational Support Network**

### Secondary modules
- Franchise CRM
- AI Agents
- Issue Radar
- Knowledge Base
- Analytics
- Subscription / Finance

---

# 59. MVP Cut Line

If development time becomes constrained, keep only this:

```text
AUTH
 ↓
FRANCHISE CRM
 ↓
COMMUNITY
 ↓
AI CLASSIFICATION
 ↓
SIMILARITY SEARCH
 ↓
ROUTING
 ↓
ANSWER
 ↓
ACCEPTED SOLUTION
 ↓
KNOWLEDGE ARTICLE
 ↓
HQ ISSUE RADAR
```

Cut:
- advanced finance
- lead automation
- complex campaigns
- advanced churn ML
- multi-channel communication
- large analytics suite

This preserves the differentiated core.

---

# 60. Final Architecture Summary

```text
                         KHATACOPILOT
                              │
             ┌────────────────┴────────────────┐
             │                                 │
       FRANCHISE APP                       HQ CRM
             │                                 │
             └────────────────┬────────────────┘
                              ↓
                         API LAYER
                              ↓
                  ┌───────────┴───────────┐
                  │                       │
              CRM DATA              COMMUNITY
                  │                       │
                  └───────────┬───────────┘
                              ↓
                        EVENT ENGINE
                              ↓
                     AGENT ORCHESTRATOR
                              │
       ┌───────────┬──────────┼───────────┬────────────┐
       ↓           ↓          ↓           ↓            ↓
    Intake     Similarity   Routing   Escalation   Insights
       │           │          │           │            │
       └───────────┴──────────┼───────────┴────────────┘
                              ↓
                        HUMAN WORKFLOW
                              ↓
                         RESOLUTION
                              ↓
                     KNOWLEDGE EXTRACTION
                              ↓
                      APPROVED KNOWLEDGE
                              ↓
                    NETWORK INTELLIGENCE
                              ↓
                   PROACTIVE ISSUE DETECTION
                              ↺
                         EVENT ENGINE
```

---

# 61. Build Order for a Fully Working Prototype

## Day/Phase 1

- repository
- design system
- authentication
- Postgres schema
- seeded roles/franchises

## Day/Phase 2

- mobile Community feed
- Ask Question flow
- web Community queue

## Day/Phase 3

- AI classifier
- embeddings
- similar question retrieval

## Day/Phase 4

- routing engine
- notifications
- answer/accepted solution

## Day/Phase 5

- knowledge extraction
- article approval
- knowledge search

## Day/Phase 6

- event ingestion
- Issue Radar
- agent activity log

## Day/Phase 7

- security hardening
- audit logs
- error states
- synthetic demo data
- deployment

## Day/Phase 8

- end-to-end QA
- judge demo rehearsal
- performance fixes
- screenshots/video

---

# 62. Definition of Done

The project is considered **fully working for the MVP** only when:

- both mobile and web clients are deployed;
- authentication works end to end;
- data persists in PostgreSQL;
- a franchise can ask a question;
- AI classification is actually executed server-side;
- similarity search uses a real vector index;
- routing selects a real user/queue;
- notifications are delivered;
- an answer can be accepted;
- accepted resolution can create a knowledge draft;
- HQ can publish the knowledge article;
- a second similar question retrieves that article;
- operational events can create an Issue Radar signal;
- AI actions and human approvals are recorded in audit logs;
- there are no mock buttons in the main demo flow;
- demo data is seeded automatically;
- production configuration is stored as environment secrets, not hardcoded.

---

# 63. Immediate Engineering Backlog

## P0

- [ ] Set up monorepo
- [ ] Create Supabase/Postgres project
- [ ] Create auth + RBAC
- [ ] Create schema + migrations
- [ ] Create mobile navigation shell
- [ ] Create web CRM shell
- [ ] Implement franchise CRUD
- [ ] Implement community post CRUD
- [ ] Implement answers + accepted answer
- [ ] Implement attachments
- [ ] Implement AI classifier
- [ ] Implement embeddings + pgvector
- [ ] Implement similarity retrieval
- [ ] Implement resolver routing
- [ ] Implement SLA/escalation worker
- [ ] Implement push notifications
- [ ] Implement knowledge extraction
- [ ] Implement knowledge approval
- [ ] Implement knowledge search
- [ ] Implement event ingestion
- [ ] Implement issue cluster page
- [ ] Implement agent run logs
- [ ] Implement audit log

## P1

- [ ] Franchise health analytics
- [ ] Feature request aggregation
- [ ] Reputation/expertise profile
- [ ] Subscription dashboard
- [ ] Advanced anomaly detection
- [ ] regional views
- [ ] bulk admin actions

---

# 64. Final Product Story

KhataCopilot NetworkOS should feel like this:

```text
A franchise owner has a problem.

        ↓

They ask the community in seconds.

        ↓

AI understands the problem.

        ↓

It finds previous solutions and the best person to help.

        ↓

The question is resolved locally when possible.

        ↓

If not, it moves to regional support and then HQ.

        ↓

The final resolution becomes verified knowledge.

        ↓

The next franchise gets the solution faster.

        ↓

If many stores experience the same problem,
HQ sees the pattern as an emerging incident.

        ↓

The network becomes smarter with every verified resolution.
```

**That closed loop is the core product.**
