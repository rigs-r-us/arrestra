import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    has_AUTH_SECRET: !!process.env.AUTH_SECRET,
    has_NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    has_AUTH_TRUST_HOST: !!process.env.AUTH_TRUST_HOST,
    has_NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    has_AUTH_URL: !!process.env.AUTH_URL,
    node_env: process.env.NODE_ENV,
  });
}
