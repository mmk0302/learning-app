import * as schema from "./schema";

const TURSO_URL = process.env.TURSO_DATABASE_URL ?? "";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN ?? "";

function createDb() {
  // 本番: libsql:// または https:// → @libsql/client
  if (TURSO_URL.startsWith("libsql://") || TURSO_URL.startsWith("https://")) {
    const { createClient } = require("@libsql/client");
    const { drizzle } = require("drizzle-orm/libsql");
    const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
    return drizzle(client, { schema });
  }

  // ローカル開発: file: URL または未設定 → better-sqlite3
  const Database = require("better-sqlite3");
  const { drizzle } = require("drizzle-orm/better-sqlite3");
  const path = TURSO_URL.startsWith("file:") ? TURSO_URL.slice(5) : "./dev.db";
  return drizzle(new Database(path), { schema });
}

export const db = createDb();
