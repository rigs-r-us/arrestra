'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { markLeadMailSent } from '@/lib/leadMutations';

export async function markMailSentBulk(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const leadIds = formData.getAll('leadId').map(String).filter(Boolean);
  if (leadIds.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const leadId of leadIds) {
      await markLeadMailSent(tx, user.tenantId, user.id, leadId);
    }
  });

  revalidatePath('/mail-queue');
  revalidatePath('/dashboard');
  revalidatePath('/campaigns');
}
