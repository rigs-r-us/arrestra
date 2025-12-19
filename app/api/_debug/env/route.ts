import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    AUTH_URL: process.env.AUTH_URL ?? null,
    AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
    DATABASE_URL_SET: !!process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}
