import { auth } from './auth';
import { prisma } from './db';

export async function getTenantFromRequest() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true },
  });
  if (!user?.tenantId) return null;

  return prisma.tenant.findUnique({ where: { id: user.tenantId } });
}
