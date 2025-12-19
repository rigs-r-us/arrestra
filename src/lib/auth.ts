import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// ✅ Pick ONE canonical secret name in prod if you can (NEXTAUTH_SECRET is common)
// but this fallback is fine:
function getAuthSecret() {
  return (
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.AUTHJS_SECRET ??
    ""
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // ✅ don't hard-crash at import-time; NextAuth will error nicely if missing,
  // but we can still fail early *inside* config:
  secret: getAuthSecret() || undefined,

  // ✅ On prod, trustHost must be true OR you must set NEXTAUTH_URL correctly
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.NODE_ENV === "development",

  basePath: "/api/auth",
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.hashedPassword) return null;

        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) return null;

        // ✅ must return at least { id }
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],

  // ✅ Optional but very useful: make id available in session
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
});
