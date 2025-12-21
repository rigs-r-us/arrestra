import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const secret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTHJS_SECRET ??
  "dev-placeholder-secret-for-build"; // prevents build-time crash

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret,
  trustHost: true,
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
        if (!credentials) return null;

        const { email, password } = credentials;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.hashedPassword) return null;

        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
});