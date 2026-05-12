function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const env = {
  AUTH_SECRET: mustGetEnv("AUTH_SECRET"),
  AUTH_URL: mustGetEnv("AUTH_URL"),
  DATABASE_URL: mustGetEnv("DATABASE_URL"),
};


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
