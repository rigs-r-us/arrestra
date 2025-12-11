// middleware.ts (temporary minimal version to unblock build)

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // For now, just pass the request through.
  // We can reintroduce tenant-aware routing here later.
  return NextResponse.next();
}
