function getEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v : undefined;
}

export function mustGetEnv(name: string): string {
  const v = getEnv(name);
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

// ✅ Lazy getters (do not throw at import)
export const env = {
  // Use NEXTAUTH_URL for Auth.js/NextAuth
  authUrl: () => getEnv("AUTH_URL") ?? getEnv("NEXTAUTH_URL"),

  // Use whichever secret you actually set in Amplify
  authSecret: () =>
    getEnv("AUTH_SECRET") ?? getEnv("NEXTAUTH_SECRET") ?? getEnv("AUTHJS_SECRET"),

  databaseUrl: () => getEnv("DATABASE_URL"),

  trustHost: () => getEnv("AUTH_TRUST_HOST") === "true",
  debug: () => getEnv("NEXTAUTH_DEBUG") === "true",
};
