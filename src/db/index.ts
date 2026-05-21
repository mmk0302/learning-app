import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL!;
const dbPath = url.startsWith("file:") ? url.replace("file:", "") : "./dev.db";

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
