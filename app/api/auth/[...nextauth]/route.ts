import { handlers } from "@/src/lib/auth";

export const runtime = "nodejs"; // 🔴 REQUIRED ON AMPLIFY
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
