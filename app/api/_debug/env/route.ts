export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    AUTH_URL: process.env.AUTH_URL ?? null,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    AUTH_SECRET_SET: Boolean(process.env.AUTH_SECRET),
    NEXTAUTH_SECRET_SET: Boolean(process.env.NEXTAUTH_SECRET),
    DATABASE_URL_SET: Boolean(process.env.DATABASE_URL),
    NODE_ENV: process.env.NODE_ENV,
  });
}
