import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl:
      process.env.DATABASE_SSL === "false" ||
      databaseUrl.includes("localhost") ||
      databaseUrl.includes("127.0.0.1")
        ? false
        : "require",
  });

  try {
    const migrationPath = path.join(process.cwd(), "db", "migrations", "001_initial.sql");
    const migration = await readFile(migrationPath, "utf8");
    await sql.unsafe(migration);
    console.log("Applied migrations.");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

