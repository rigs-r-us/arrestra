function mustGetEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const env = {
  AUTH_SECRET: mustGetEnv("AUTH_SECRET"),
  AUTH_URL: mustGetEnv("AUTH_URL"),
  DATABASE_URL: mustGetEnv("DATABASE_URL"),
};
