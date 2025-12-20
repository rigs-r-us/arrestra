export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const pick = (k: string) => process.env[k] ?? null;

  return Response.json({
    NODE_ENV: process.env.NODE_ENV,
    AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
    NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
    AUTH_URL: pick("AUTH_URL"),
    NEXTAUTH_URL: pick("NEXTAUTH_URL"),
    DATABASE_URL_SET: !!process.env.DATABASE_URL,

    // these help confirm you're in Amplify compute
    AWS_REGION: pick("AWS_REGION"),
    AWS_LAMBDA_FUNCTION_NAME: pick("AWS_LAMBDA_FUNCTION_NAME"),
    AWS_BRANCH: pick("AWS_BRANCH"),
    AWS_COMMIT_ID: pick("AWS_COMMIT_ID"),
  });
}
