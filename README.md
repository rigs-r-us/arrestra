                           ┌────────────────────────────────────────────────┐
                           │                 Public Web                     │
                           │      (Attorneys / Firms / API Clients)         │
                           └────────────────────────────────────────────────┘
                                               │
                            HTTPS requests to firm subdomains (e.g. smithlaw.arrestra.com)
                                               │
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        🌩️ AWS Amplify (Hosting + SSR)                                  │
│  - Hosts Next.js App (App Router)                                                       │
│  - Handles API routes (/api/leads/*, /api/auth/*) as AWS Lambda functions              │
│  - Uses CloudFront + ACM for wildcard SSL (*.arrestra.com)                             │
│                                                                                        │
│       ┌──────────────────────┐       ┌────────────────────────────┐                    │
│       │ Next.js Frontend UI  │       │ Next.js API Routes (SSR)  │                    │
│       │ - Login, Dashboard   │◄─────►│ - /api/leads/ingest       │                    │
│       │ - Settings per firm  │       │ - /api/leads/enrich/*     │                    │
│       │ - Status updates     │       │ - /api/leads/export       │                    │
│       └──────────────────────┘       └────────────────────────────┘                    │
│                                                                                        │
│                  ▲                                                       ▲             │
│                  │                                                       │             │
│     Auth via NextAuth + Prisma Adapter                           Enrichment API Calls  │
│                  │                                                       │             │
└──────────────────┼───────────────────────────────────────────────────────┼─────────────┘
                   │                                                       │
                   │                                                       │
                   ▼                                                       ▼
     ┌────────────────────────┐                         ┌──────────────────────────────┐
     │     PostgreSQL DB      │                         │   External Enrichment APIs   │
     │ (RDS / Neon / Railway) │                         │ ──────────────────────────── │
     │────────────────────────│                         │ • Twilio Lookup API          │
     │ Tenants                │                         │   - Validates phone numbers  │
     │ Domains                │                         │ • Kickbox API               │
     │ Users (NextAuth)       │                         │   - Verifies email quality   │
     │ Leads + Enrichments    │                         │ • Future APIs:              │
     │ LeadEvents (audit log) │                         │   - Jail roster             │
     │                        │                         │   - Docket / case data      │
     └────────────────────────┘                         └──────────────────────────────┘
                   ▲
                   │
                   │
           Prisma Client ORM
          (used by API + Auth)
                   │
                   ▼
       ┌──────────────────────────┐
       │   Background Workers     │
       │  (AWS Lambda / CronJob)  │
       │ ───────────────────────  │
       │ • topics-travis.ts       │
       │   - Scrapes TOPICs site  │
       │   - Calls /api/leads/ingest
       │ • (Future: county bots)  │
       └──────────────────────────┘

---

### 🔑 **Data Flow Summary**

1. **Lead Intake**
   - Worker (e.g., `topics-travis.ts`) scrapes the TOPICs bail data.
   - Sends a POST → `/api/leads/ingest` with tenant API key.
   - Amplify (Next.js API route) inserts the lead → `Lead` + event log.

2. **Lead Enrichment**
   - Either on-demand or via a scheduled worker.
   - Calls `/api/leads/enrich/contact`.
   - Invokes **Twilio Lookup** + **Kickbox**, stores results in `Enrichment` + `LeadEvent`.

3. **Firm Dashboard**
   - Attorney logs in via subdomain (`firm.arrestra.com`).
   - NextAuth verifies credentials scoped to that firm’s tenant.
   - Dashboard fetches all tenant-scoped leads with enrichment data.

4. **Pipeline Management**
   - Firms can change lead statuses (`/api/leads/status`).
   - All changes logged as `LeadEvent`.

5. **Export / Reporting**
   - CSV export endpoint → `/api/leads/export`.
   - Firms can download enriched lead data for offline CRM sync.

---

### 🏗️ **Multi-Tenant Isolation Model**

| Layer | Isolation Mechanism |
|-------|---------------------|
| **Domain/Subdomain** | `*.arrestra.com` wildcard → tenant inferred from subdomain |
| **Auth** | Users scoped by `tenantId` in DB |
| **DB Rows** | Tenant-scoped `tenantId` foreign key on all sensitive tables |
| **API Access** | Tenant `apiKey` required for ingestion/enrichment |
| **Enrichment Calls** | Per-tenant rate limits possible in future |

---

### 🚀 **Scalability Plan**

| Concern | Approach |
|----------|-----------|
| **Hosting** | Amplify auto-scales Lambdas; edge-cached assets via CloudFront |
| **Database** | Postgres vertical scaling → read replicas (RDS) |
| **Workers** | Move scrapers/enrichers to AWS Lambda or ECS Fargate |
| **Subdomains** | Wildcard DNS; dynamic tenant routing via middleware |
| **Future Add-ons** | SQS queue for async enrichments, SNS alerts, S3 for evidence files |

---
- 🧠 **Mermaid (Markdown-ready)** diagram, or  
- 🖼️ **Visual PNG system diagram** (Amplify, DB, APIs, flow arrows)?
