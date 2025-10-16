flowchart LR
  %% ====== Arrestra Multi-Tenant Architecture (Amplify) ======
  %% Style tweaks
  classDef cloud fill:#f0f7ff,stroke:#6aa0ff,color:#0b3d91
  classDef db fill:#f7f5ff,stroke:#8b5cf6,color:#312e81
  classDef box fill:#fff,stroke:#94a3b8,color:#0f172a
  classDef ext fill:#fff7ed,stroke:#fb923c,color:#7c2d12
  classDef worker fill:#ecfeff,stroke:#06b6d4,color:#083344

  %% Public web
  A[("Public Web<br/>(Attorneys • Firms • API Clients)<br/><small>firm.arrestra.com</small>")]:::box

  %% Amplify hosting (Next.js app + API)
  subgraph B[AWS Amplify Hosting + SSR<br/><small>CloudFront + Lambda@Edge</small>]
    direction TB
    B1[Next.js Frontend (App Router)<br/><small>Login • Dashboard • Settings</small>]:::box
    B2[Next.js API Routes<br/><small>/api/leads/ingest<br/>/api/leads/enrich/*<br/>/api/leads/status<br/>/api/leads/export</small>]:::box
    B3[Middleware<br/><small>Resolve tenant from subdomain → set x-tenant-id</small>]:::box
  end
  class B cloud

  %% Database
  C[(PostgreSQL)<br/><small>RDS / Neon / Railway</small>]:::db
  C1[[Prisma ORM]]:::box
  C2[[NextAuth Adapter]]:::box

  %% External enrichment
  subgraph D[External Enrichment APIs]
    D1[Twilio Lookup<br/><small>phone validity + line type</small>]:::ext
    D2[Kickbox<br/><small>email deliverability</small>]:::ext
    D3[Future: Jail Roster / Dockets]:::ext
  end

  %% Background workers
  subgraph E[Background Workers / Cron]
    E1[topics-travis.ts<br/><small>scrape TOPICs → POST /api/leads/ingest</small>]:::worker
    E2[Future: county bots / queues]:::worker
  end

  %% Flows
  A -->|"HTTPS to firm subdomain"| B3 --> B1
  B1 -->|"Auth (credentials)"| C2
  B2 -->|"Prisma Client"| C1 --> C

  %% API calls to external services
  B2 -->|"Enrichment calls"| D1
  B2 -->|"Enrichment calls"| D2
  B2 -. optional .-> D3

  %% Workers push leads in
  E1 -->|"x-api-key scoped ingest"| B2
  E2 -.-> B2

  %% Tenant isolation notes
  note right of B3
    Multi-tenant:
    • subdomain → Tenant/Domain
    • x-tenant-id header
    • DB rows scoped by tenantId
    • Ingest/enrich require per-tenant apiKey
  end
