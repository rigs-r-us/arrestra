function mustGetEnv(key: string, fallbackKey?: string) {
  const value = process.env[key] || (fallbackKey ? process.env[fallbackKey] : undefined);

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}${fallbackKey ? ` or ${fallbackKey}` : ''}`,
    );
  }

  return value;
}

export const env = {
  AUTH_SECRET: mustGetEnv("AUTH_SECRET", "NEXTAUTH_SECRET"),
  AUTH_URL: mustGetEnv("AUTH_URL", "NEXTAUTH_URL"),
  DATABASE_URL: mustGetEnv("DATABASE_URL"),
};
