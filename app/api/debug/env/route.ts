import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const has = (k: string) => !!process.env[k] && process.env[k]!.trim().length > 0;

  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    AUTH_URL: process.env.AUTH_URL ?? null,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    AUTH_SECRET_SET: has("AUTH_SECRET"),
    NEXTAUTH_SECRET_SET: has("NEXTAUTH_SECRET"),
    DATABASE_URL_SET: has("DATABASE_URL"),
    AWS_REGION: process.env.AWS_REGION ?? null,
    AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME ?? null,
  });
}
