'use server';

import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';
import { requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/db';

const VALID_ROLES = ['ADMIN', 'ATTORNEY', 'STAFF'] as const;
type Role = (typeof VALID_ROLES)[number];

function isValidRole(value: string): value is Role {
  return (VALID_ROLES as readonly string[]).includes(value);
}

export async function addTeamMember(formData: FormData) {
  const admin = await requireAdmin();

  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const roleInput = String(formData.get('role') || 'STAFF');

  if (!name || !email || password.length < 8 || !isValidRole(roleInput)) {
    throw new Error('Name, a valid email, an 8+ character password, and a role are required.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error(`A user with email ${email} already exists.`);
  }

  const hashedPassword = await hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role: roleInput,
      tenantId: admin.tenantId,
    },
  });

  revalidatePath('/settings');
}

async function assertNotLastAdmin(tenantId: string, userId: string) {
  const remainingAdmins = await prisma.user.count({
    where: { tenantId, role: 'ADMIN', id: { not: userId } },
  });

  if (remainingAdmins === 0) {
    throw new Error(
      'This is the last admin on this account. Promote another user to admin before changing or removing this one.'
    );
  }
}

export async function changeUserRole(formData: FormData) {
  const admin = await requireAdmin();

  const userId = String(formData.get('userId') || '');
  const roleInput = String(formData.get('role') || '');
  if (!userId || !isValidRole(roleInput)) return;

  const target = await prisma.user.findUnique({
    where: { id: userId, tenantId: admin.tenantId },
  });
  if (!target) return;

  if (target.role === 'ADMIN' && roleInput !== 'ADMIN') {
    await assertNotLastAdmin(admin.tenantId, userId);
  }

  await prisma.user.update({
    where: { id: userId, tenantId: admin.tenantId },
    data: { role: roleInput },
  });

  revalidatePath('/settings');
}

export async function removeTeamMember(formData: FormData) {
  const admin = await requireAdmin();

  const userId = String(formData.get('userId') || '');
  if (!userId) return;

  const target = await prisma.user.findUnique({
    where: { id: userId, tenantId: admin.tenantId },
  });
  if (!target) return;

  if (target.role === 'ADMIN') {
    await assertNotLastAdmin(admin.tenantId, userId);
  }

  await prisma.user.delete({ where: { id: userId, tenantId: admin.tenantId } });

  revalidatePath('/settings');
}
