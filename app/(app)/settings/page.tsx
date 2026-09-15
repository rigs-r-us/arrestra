import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { addTeamMember, changeUserRole, removeTeamMember } from './actions';

const ROLES = ['ADMIN', 'ATTORNEY', 'STAFF'] as const;

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const admin = await requireAdmin();

  const members = await prisma.user.findMany({
    where: { tenantId: admin.tenantId },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Settings</h1>
        <p className="text-slate-400">Manage who on your team has access to Arrestra.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name || '—'}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <form action={changeUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={member.id} />
                      <select
                        name="role"
                        defaultValue={member.role}
                        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" size="sm" variant="secondary">
                        Update
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>
                    <form action={removeTeamMember}>
                      <input type="hidden" name="userId" value={member.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="destructive"
                        disabled={member.id === admin.id}
                        title={
                          member.id === admin.id
                            ? "You can't remove your own account here."
                            : undefined
                        }
                      >
                        Remove
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addTeamMember} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Name</label>
              <input
                name="name"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Temporary Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Role</label>
              <select
                name="role"
                defaultValue="STAFF"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <Button type="submit">Add Team Member</Button>
              <p className="mt-2 text-xs text-slate-400">
                Share this password with them directly — there's no email invite yet, so this is
                the only way they'll get it.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
