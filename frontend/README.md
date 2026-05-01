# SmartHire — AI-Powered Multi-Tenant Hiring Platform

> **Built by [Ganga Lova Raju Yerikireddy](https://github.com/Gangalovaraju)**  
> Java Full Stack Developer · [GitHub](https://github.com/Gangalovaraju) · [LinkedIn](https://linkedin.com/in/gangalovaraju)

---

A production-grade, multi-tenant SaaS hiring platform that uses **Claude AI** to automatically screen and rank resumes in real time. Built to FAANG-level standards with a complete Spring Boot microservice backend, React.js SPA frontend, PostgreSQL database, and WebSocket live feed.

---

## Why This Project Stands Out

| What Interviewers Look For | What SmartHire Demonstrates |
|---|---|
| Real AI integration | Claude API (`claude-sonnet-4`) with structured JSON output |
| Multi-tenant SaaS | Shared-schema PostgreSQL, JWT with tenantId claim |
| Async processing | Spring `@Async` + `@Transactional` AI pipeline |
| Real-time systems | WebSocket (STOMP over SockJS) live scoring feed |
| Production DB design | Indexed schema, triggers, seed data, `validate` DDL |
| Frontend excellence | React 18, Redux Toolkit, Recharts, dark design system |
| Clean architecture | Service → Repository → Entity, DTOs, ThreadLocal tenant context |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React.js SPA)                  │
│  Login · Dashboard · Jobs · Pipeline · Live Screen         │
│  Redux Toolkit · Recharts · STOMP WebSocket · Axios        │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST + WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│                  BACKEND (Spring Boot 3.2)                  │
│                                                             │
│  AuthController → AuthService → JwtUtils                   │
│  JobController  → JobService  → JobRepo                    │
│  CandidateController → CandidateService                    │
│       └─→ @Async triggerAiScoring()                        │
│              └─→ AiScoringService (WebClient)              │
│                     └─→ Anthropic Claude API               │
│                            └─→ WebSocket broadcast         │
│                                                             │
│  TenantJwtFilter (ThreadLocal tenant isolation)            │
│  Spring Security 6 · JWT (jjwt 0.12) · RBAC               │
└──────────────────────┬──────────────────────────────────────┘
                       │ JPA / Hibernate
┌──────────────────────▼──────────────────────────────────────┐
│               PostgreSQL (shared-schema multi-tenant)       │
│  companies · hr_users · job_postings · candidates           │
│  Indexes · Triggers · Seed data                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.2, Spring Security 6, Spring WebSocket (STOMP) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Async | Spring `@Async`, `@EnableAsync` |
| Auth | JWT (jjwt 0.12), BCrypt, RBAC (ADMIN/RECRUITER/VIEWER) |
| Database | PostgreSQL 15+, Hibernate JPA, HikariCP connection pool |
| Frontend | React 18, Redux Toolkit, React Router v6 |
| Charts | Recharts (AreaChart, PieChart) |
| Real-time | SockJS + STOMP (`@stomp/stompjs`) |
| Build | Vite 5, Maven |

---

## Quick Start

### Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL 15+
- (Optional) Anthropic API key for real AI scoring

### 1. Database Setup
```bash
createdb smarthire_db
psql smarthire_db < database/schema.sql
```

### 2. Backend
```bash
cd backend

# Set your Anthropic API key (optional — keyword fallback if not set)
export ANTHROPIC_API_KEY=sk-ant-...

# Run
./mvnw spring-boot:run
# → http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 4. Login
Use the demo credentials seeded by `schema.sql`:

| Company ID | Email | Password | Role |
|---|---|---|---|
| `acme-corp` | `admin@acme.com` | `password123` | ADMIN |
| `nexgen-tech` | `bob@nexgen.com` | `password123` | RECRUITER |

---

## AI Scoring Pipeline (Step by Step)

```
1. POST /api/candidates  ← HR submits resume text
2. Candidate saved with status = APPLIED
3. @Async triggerAiScoring(candidateId, tenantId) fires
4. status → AI_SCREENING
5. WebSocket: SCREENING_STARTED broadcast
6. AiScoringService.scoreResume() calls Anthropic:
   
   {
     "model": "claude-sonnet-4-20250514",
     "messages": [{ "role": "user", "content": "<resume + job desc prompt>" }]
   }

7. Claude returns structured JSON:
   {
     "score": 82,
     "skillMatchPct": 90,
     "summary": "Experienced Java developer with 5 years...",
     "strengths": "Spring Boot, Microservices, React",
     "gaps": "Kubernetes, AWS",
     "biasFlags": "none",
     "recommendation": "SHORTLIST"
   }

8. Candidate record updated with all AI fields
9. If SHORTLIST → status = SHORTLISTED automatically
10. WebSocket: SCORING_COMPLETE broadcast → frontend updates live
```

> **Without API key:** keyword-based fallback scoring activates automatically.

---

## API Reference

```
POST /api/companies/register   Register new company (public)
POST /api/auth/login           Login → JWT token

GET  /api/jobs                 All jobs (tenant-scoped)
POST /api/jobs                 Create job posting
PUT  /api/jobs/{id}            Update job
DELETE /api/jobs/{id}          Delete job

POST /api/candidates           Submit candidate (triggers async AI)
GET  /api/candidates/job/{id}  Candidates for a job (sorted by AI score)
GET  /api/candidates/{id}      Candidate detail
PUT  /api/candidates/{id}/status  Update status
GET  /api/candidates/dashboard  Hiring stats

WS   /ws  (STOMP)             Subscribe: /topic/screening/{tenantId}
```

---

## One Repo vs Two Repos?

**Recommendation: One Monorepo** (this structure)

```
smarthire/
├── backend/       ← Spring Boot
├── frontend/      ← React + Vite
├── database/      ← schema.sql
└── README.md
```

**Why:** For a portfolio project, one repo is far superior:
- Recruiters see the full scope in one click
- One README tells the complete story
- Easier to clone and run
- GitHub shows the full tech spread on your profile

Two repos only make sense at company scale when different teams deploy independently.

---

## Repo Structure

```
smarthire/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/smarthire/
│       ├── SmartHireApplication.java
│       ├── config/          SecurityConfig, JwtUtils, WebSocketConfig
│       ├── context/         TenantContextHolder (ThreadLocal)
│       ├── controller/      Auth, Company, JobPosting, Candidate
│       ├── dto/             AuthDTO (Login/Register/Dashboard)
│       ├── entity/          Company, HrUser, JobPosting, Candidate
│       ├── filter/          TenantJwtFilter
│       ├── repository/      All JPA repositories (tenant-scoped)
│       └── service/         Auth, JobPosting, Candidate, AiScoring
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html           Attribution in HTML + CSS fallback
│   └── src/
│       ├── api/             Axios client + interceptors
│       ├── components/      BuiltBy, Sidebar, ScoreRing, StatusBadge
│       ├── pages/           Login, Dashboard, Jobs, Pipeline, LiveScreen
│       ├── store/           Redux slices (auth + screening events)
│       └── styles/          globals.css (design system)
└── database/
    └── schema.sql           Full schema + indexes + triggers + seed data
```

---

## Multi-Tenant Design

Every DB table has a `tenant_id` column. The `TenantJwtFilter` extracts `tenantId` from the JWT on every request and stores it in `ThreadLocal` via `TenantContextHolder`. Every repository query is scoped to `TenantContextHolder.get()` — so `acme-corp` can never see `nexgen-tech`'s data even though they share the same database.

---

## Attribution

```
SmartHire — AI-Powered Multi-Tenant Hiring Platform
Developer : Ganga Lova Raju Yerikireddy
GitHub    : https://github.com/Gangalovaraju
LinkedIn  : https://linkedin.com/in/gangalovaraju
```
