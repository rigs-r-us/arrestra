                          +----------------------------------------------+
                          |                 Public Web                   |
                          |   (Attorneys / Firms / API clients)          |
                          |   firm.arrestra.com                          |
                          +---------------------------+------------------+
                                                      |
                                                      v
+--------------------------------------------------------------------------+
|                AWS Amplify Hosting (Next.js 14 + SSR)                    |
|  - CloudFront CDN + wildcard SSL (*.arrestra.com)                        |
|  - Lambda-based SSR / API routes                                         |
|                                                                          |
|  +----------------------+    +-------------------------------+           |
|  | Frontend (App Router)|<-->| API Routes                    |           |
|  | /dashboard /login    |    | /api/leads/*  /api/auth/*     |           |
|  | /settings            |    | /api/leads/enrich/* /export   |           |
|  +----------------------+    +-------------------------------+           |
|               ^                         |                                 |
|               |                         | Prisma ORM                      |
|        NextAuth auth                    v                                 |
+---------------+-------------------------+---------------------------------+
                |                                                           |
                v                                                           v
        +-------------------+                                   +-----------------------+
        |   PostgreSQL DB   |                                   | External Enrichment   |
        |  (RDS/Neon/etc.)  |                                   |   APIs                |
        |-------------------|                                   | - Twilio Lookup       |
        | Tenants           |                                   | - Kickbox             |
        | Domains           |                                   | - (future: rosters/   |
        | Users (NextAuth)  |                                   |    dockets, etc.)     |
        | Leads             |                                   +-----------------------+
        | Enrichments       |
        | LeadEvents (audit)|
        +-------------------+

                ^
                | Prisma Client
                |
+---------------+------------------------------------------------------------------+
|                          Background Workers / Cron                               |
|  - topics-travis.ts (scrape TOPICs)  -->  POST /api/leads/ingest (x-api-key)     |
|  - future: county bots / queues                                                   |
+----------------------------------------------------------------------------------+

