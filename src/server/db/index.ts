import { drizzle } from "drizzle-orm/d1";
// import { drizzle as drizzleSqlite } from "drizzle-orm/d1";
// import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
// import { drizzle as drizzleSqlite } from 'drizzle-orm/libsql/http';
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/http";

import * as schema from "@/server/db/schema";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

const { CLOUDFLARE_DB_URL, CLOUDFLARE_D1_API_TOKEN } = process.env;

// console.log("process.env", process.env);
console.log(
  "URL",
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.CLOUDFLARE_DATABASE_ID}/query`
);

function initDbConnection() {
  if (process.env.NODE_ENV === "development") {
    const client = createClient({
      url: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.CLOUDFLARE_DATABASE_ID}/query`,
      authToken: CLOUDFLARE_D1_API_TOKEN!,
    });

    return drizzleLibsql(client, { schema });
  }

  console.log("process.env.DB", process.env);
  return drizzle(process.env.DB as unknown as D1Database, { schema });
}

export const db = initDbConnection();
