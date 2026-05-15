import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    databaseUrlPrefix: process.env.DATABASE_URL?.slice(0, 12) ?? null,
    hasAuthSecret: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    hasAuthUrl: Boolean(process.env.AUTH_URL || process.env.NEXTAUTH_URL),
  });
}
