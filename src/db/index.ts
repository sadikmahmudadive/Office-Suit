import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Postgres connection string to .env.local (see .env.example), then restart the dev server.",
    );
  }
  // prepare: false keeps this compatible with Neon's pooled (PgBouncer) URLs.
  const client = postgres(url, { prepare: false, max: 5 });
  return drizzle(client, { schema });
}

type Db = ReturnType<typeof createDb>;

// Reuse one connection pool across hot reloads in development.
const globalForDb = globalThis as unknown as { db?: Db };

function getDb() {
  globalForDb.db ??= createDb();
  return globalForDb.db;
}

// Connects on first use, so builds and imports work without a database.
export const db = new Proxy({} as Db, {
  get(_, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
