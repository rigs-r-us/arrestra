import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // never return secrets
  return NextResponse.json({
    AUTH_URL: process.env.AUTH_URL ?? null,
    AUTH_SECRET_SET: Boolean(process.env.AUTH_SECRET),
    DATABASE_URL_SET: Boolean(process.env.DATABASE_URL),
    NODE_ENV: process.env.NODE_ENV ?? null,
  });
}
