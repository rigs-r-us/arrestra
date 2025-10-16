flowchart LR
  %% Arrestra Multi-Tenant SaaS Architecture (AWS Amplify)

  %% Public web
  A["Public Web<br/>(Attorneys / Firms / API Clients)<br/><small>firm.arrestra.com</small>"]

  %% Amplify hosting
  subgraph B["AWS Amplify Hosting (Next.js 14 + SSR)"]
    direction TB
    B1["Next.js Frontend<br/><small>Dashboard / Login / Settings</small>"]
    B2["Next.js API Routes<br/><small>/api/leads/ingest<br/>/api/leads/enrich/*<br/>/api/leads/status<br/>/api/leads/export</small>"]
    B3["Middleware<br/><small>Resolve tenant from subdomain → set x-tenant-id</small>"]
  end

  %% Database
  subgraph C["PostgreSQL (RDS / Neon / Railway)"]
    C1["Prisma ORM"]
    C2["NextAuth Adapter"]
  end

  %% External enrichment
  subgraph D["External APIs"]
    D1["Twilio Lookup<br/><small>Validate phone numbers</small>"]
    D2["Kickbox<br/><small>Verify email deliverability</small>"]
    D3["Future: Jail Roster / Docket Lookups"]
  end

  %% Background workers
  subgraph E["Background Workers / Cron"]
    E1["topics-travis.ts<br/><small>Scrape TOPICs → POST /api/leads/ingest</small>"]
    E2["Future County Bots / Queues"]
  end

  %% Relationships
  A -->|"HTTPS to subdomain"| B3 --> B1
  B1 -->|"Auth via NextAuth"| C2
  B2 -->|"DB Access via Prisma"| C1 --> C
  B2 -->|"Enrichment calls"| D1
  B2 -->|"Enrichment calls"| D2
  B2 -. optional .-> D3
  E1 -->|"POST /api/leads/ingest"| B2
  E2 -.-> B2

  %% Notes
  note right of B3
    Multi-Tenant Isolation:
    - Subdomain → Tenant mapping  
    - x-tenant-id header per request  
    - Tenant-scoped DB rows  
    - Ingest/enrich require API key
  end
