export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    AUTH_URL: process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? null,
    AUTH_SECRET_SET: Boolean(
      process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.AUTHJS_SECRET
    ),
    DATABASE_URL_SET: Boolean(process.env.DATABASE_URL),
    NODE_ENV: process.env.NODE_ENV ?? null,

    // Useful “what is deployed?” markers (Amplify often sets these)
    AWS_BRANCH: process.env.AWS_BRANCH ?? null,
    AWS_COMMIT_ID: process.env.AWS_COMMIT_ID ?? null,
  });
}
