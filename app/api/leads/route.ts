import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '../../../src/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { tenantId: true },
  });

  if (!dbUser?.tenantId) {
    return NextResponse.json(
      { error: 'User has no tenant associated' },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const limitParam = url.searchParams.get('limit');
  const limit = Math.min(Number(limitParam || '50') || 50, 200);

  const leads = await prisma.lead.findMany({
    where: { tenantId: dbUser.tenantId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ leads });
}
