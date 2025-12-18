import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db"; // <-- use your singleton db.ts (recommended)

const secret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTHJS_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  // For Amplify / CloudFront this is usually needed:
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.AUTH_TRUST_HOST === "1" || true,

  // ✅ IMPORTANT: do NOT set basePath unless you *know* you changed it elsewhere.
  // Your route is already /api/auth/[...nextauth], so leave this out.
  // basePath: "/api/auth",

  // ✅ REQUIRED: must be defined in prod
  secret,

  adapter: PrismaAdapter(prisma),

  session: { strategy: "jwt" },

  // Helpful while debugging:
  debug: process.env.NEXTAUTH_DEBUG === "true",

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
        if (!user || !user.hashedPassword) return null;

        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          role: user.role,
        };
      },
    }),
  ],
});
