export function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim().length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const env = {
  AUTH_URL: mustGetEnv("AUTH_URL"),
  AUTH_SECRET: mustGetEnv("AUTH_SECRET"),
  DATABASE_URL: mustGetEnv("DATABASE_URL"),
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST === "true",
  NEXTAUTH_DEBUG: process.env.NEXTAUTH_DEBUG === "true",
};
