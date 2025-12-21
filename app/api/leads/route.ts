import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/app/lib/auth";
import { prisma } from '../../../src/lib/db';

export async function GET(req: NextRequest) {
  // 1) Make sure user is logged in
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = session.user.email as string;

  // 2) Look up the user in the DB to get tenantId
  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { tenantId: true },
  });

  if (!dbUser?.tenantId) {
    return NextResponse.json(
      { error: 'User has no tenant associated' },
      { status: 403 },
    );
  }

  const tenantId = dbUser.tenantId;

  // 3) Read optional query params for future filtering
  const url = new URL(req.url);
  const limitParam = url.searchParams.get('limit');
  const limit = Math.min(Number(limitParam || '50') || 50, 200);

  // 4) Fetch leads for this tenant
  const leads = await prisma.lead.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // 5) Return JSON
  return NextResponse.json({ leads });
}
