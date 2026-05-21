import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL!;
const isLocalFile = url.startsWith("file:");

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: isLocalFile ? "sqlite" : "turso",
  ...(isLocalFile
    ? { dbCredentials: { url: url.replace("file:", "") } }
    : {
        dbCredentials: {
          url,
          authToken: process.env.TURSO_AUTH_TOKEN,
        },
      }),
} satisfies Config;
