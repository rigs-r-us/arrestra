import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // TODO: Verify signature and handle events
  return NextResponse.json({ ok: true });
}
