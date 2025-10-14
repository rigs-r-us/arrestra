import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [Credentials({
    name: 'Credentials',
    credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await prisma.user.findUnique({ where: { email: credentials.email } });
      if (!user) return null;
      const ok = await bcrypt.compare(credentials.password, user.hashedPassword);
      if (!ok) return null;
      return { id: user.id, email: user.email, name: user.name, tenantId: user.tenantId, role: user.role };
    },
  })],
  callbacks: {
    async jwt({ token, user }) { if (user) { // @ts-ignore
      token.tenantId = user.tenantId; // @ts-ignore
      token.role = user.role; } return token; },
    async session({ session, token }) { // @ts-ignore
      session.user.tenantId = token.tenantId; // @ts-ignore
      session.user.role = token.role; return session; },
  },
});
