import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Verify DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not defined. Make sure you have a .env file with DATABASE_URL set."
  );
}

// Prevent multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var db: PostgresJsDatabase<typeof schema> | undefined;
}

let db: PostgresJsDatabase<typeof schema>;
const connectionString = process.env.DATABASE_URL;

if (process.env.NODE_ENV === "production") {
  db = drizzle(postgres(connectionString), { schema });
} else {
  if (!global.db) {
    global.db = drizzle(postgres(connectionString), { schema });
  }
  db = global.db;
}

export { db };
