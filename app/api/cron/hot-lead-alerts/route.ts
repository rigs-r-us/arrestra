import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HOT_ALERT_EVENT = 'HOT_ALERT_SENT';

function baseUrl() {
  return process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}

function buildEmail(tenantName: string, leads: { id: string; name: string; county: string; charge: string; score: number }[]) {
  const dashboardUrl = `${baseUrl()}/dashboard`;

  const rowsHtml = leads
    .map(
      (lead) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;">${escapeHtml(lead.name)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(lead.county)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(lead.charge)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${lead.score}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">
            <a href="${baseUrl()}/leads/${lead.id}" style="color:#E53935;">View</a>
          </td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:sans-serif;color:#1C1917;max-width:640px;">
      <h2 style="margin-bottom:4px;">${leads.length} new HOT lead${leads.length === 1 ? '' : 's'} for ${escapeHtml(tenantName)}</h2>
      <p style="color:#78716C;margin-top:0;">These leads scored HOT priority since your last alert.</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #1C1917;">Name</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #1C1917;">County</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #1C1917;">Charge</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #1C1917;">Score</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #1C1917;"></th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <p style="margin-top:24px;">
        <a href="${dashboardUrl}" style="color:#E53935;">Open the full dashboard →</a>
      </p>
    </div>`;

  const text = [
    `${leads.length} new HOT lead${leads.length === 1 ? '' : 's'} for ${tenantName}`,
    '',
    ...leads.map((lead) => `- ${lead.name} (${lead.county}, score ${lead.score}): ${baseUrl()}/leads/${lead.id}`),
    '',
    `Full dashboard: ${dashboardUrl}`,
  ].join('\n');

  return { html, text };
}

export async function GET(req: NextRequest) {
  // Accept the secret via header OR query param — Amplify's CloudFront layer
  // doesn't forward arbitrary custom headers to the origin for GET requests,
  // but query params always reach it, so that's the reliable path for the
  // EventBridge Scheduler target. The header is kept for local/manual testing.
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      leads: {
        where: {
          priority: 'HOT',
          events: { none: { type: HOT_ALERT_EVENT } },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          county: true,
          charge: true,
          score: true,
        },
      },
    },
  });

  let tenantsNotified = 0;
  let leadsNotified = 0;

  for (const tenant of tenants) {
    if (tenant.leads.length === 0) continue;

    const admins = await prisma.user.findMany({
      where: { tenantId: tenant.id, role: 'ADMIN' },
      select: { email: true },
    });
    const recipients = admins.map((a) => a.email);
    if (recipients.length === 0) continue;

    const leadsForEmail = tenant.leads.map((lead) => ({
      id: lead.id,
      name: [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Unknown',
      county: lead.county || 'Unknown',
      charge: lead.charge || 'Unknown',
      score: lead.score ?? 0,
    }));

    const { html, text } = buildEmail(tenant.name, leadsForEmail);

    await sendEmail({
      to: recipients,
      subject: `${tenant.leads.length} new HOT lead${tenant.leads.length === 1 ? '' : 's'} — Arrestra`,
      html,
      text,
    });

    await prisma.leadEvent.createMany({
      data: tenant.leads.map((lead) => ({
        leadId: lead.id,
        type: HOT_ALERT_EVENT,
      })),
    });

    tenantsNotified += 1;
    leadsNotified += tenant.leads.length;
  }

  return NextResponse.json({ ok: true, tenantsNotified, leadsNotified });
}
