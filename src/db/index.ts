import * as schema from "./schema";

function createDb() {
  const url = process.env.TURSO_DATABASE_URL;

  // ローカル開発: file: URL → better-sqlite3
  if (!url || url.startsWith("file:")) {
    const Database = require("better-sqlite3");
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    const path = url ? url.replace("file:", "") : "./dev.db";
    const sqlite = new Database(path);
    return drizzle(sqlite, { schema });
  }

  // 本番: libsql URL → @libsql/client
  const { createClient } = require("@libsql/client");
  const { drizzle } = require("drizzle-orm/libsql");
  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
}

export const db = createDb();
