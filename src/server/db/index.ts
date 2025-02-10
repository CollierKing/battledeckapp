import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/server/db/schema";
import { HTTPD1Database } from "@/lib/mock-services";

export const runtime = "edge";

function initDbConnection() {
  if (process.env.NODE_ENV === "development") {
    return new HTTPD1Database(schema);
  }

  console.log("process.env.DB", process.env);
  return drizzle(process.env.DB as unknown as D1Database, { schema });
}

export const db = initDbConnection();
