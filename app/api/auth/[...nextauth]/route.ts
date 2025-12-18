import { handlers } from "@/lib/auth";

export const runtime = "nodejs"; // 🔴 REQUIRED ON AMPLIFY
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;