import postgres from "postgres";

let client: postgres.Sql | null = null;

export function getSql() {
  if (client) {
    return client;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  client = postgres(databaseUrl, {
    max: 5,
    prepare: false,
    ssl:
      process.env.DATABASE_SSL === "false" ||
      databaseUrl.includes("localhost") ||
      databaseUrl.includes("127.0.0.1")
        ? false
        : "require",
  });

  return client;
}

