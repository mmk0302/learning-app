import * as schema from "./schema";

let _db: ReturnType<typeof createDbInternal> | null = null;

function createBuildTimeDb() {
  // ビルド時はDBを接続せず、空のPromiseを返すプロキシを返す
  const emptyResult = () => Promise.resolve([]);
  const queryProxy: any = new Proxy(
    {},
    {
      get: () =>
        new Proxy(
          {},
          {
            get: () =>
              new Proxy(emptyResult, {
                get: (_t, p) => {
                  if (p === "then" || p === "catch" || p === "finally") return undefined;
                  return emptyResult;
                },
                apply: () => Promise.resolve([]),
              }),
          }
        ),
    }
  );
  return { query: queryProxy, select: () => ({ from: () => Promise.resolve([{ count: 0 }]) }) } as any;
}

function createDbInternal() {
  // ビルドフェーズではDBを接続しない
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return createBuildTimeDb();
  }

  const TURSO_URL = process.env.TURSO_DATABASE_URL ?? "";
  const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN ?? "";

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

// 遅延初期化: インポート時ではなく最初のアクセス時に DB 接続を確立
export const db = new Proxy({} as ReturnType<typeof createDbInternal>, {
  get(_target, prop) {
    if (!_db) _db = createDbInternal();
    const val = (_db as any)[prop];
    return typeof val === "function" ? val.bind(_db) : val;
  },
});
