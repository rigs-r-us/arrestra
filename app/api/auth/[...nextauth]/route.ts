// app/api/auth/[...nextauth]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
