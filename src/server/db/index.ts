import {drizzle} from "drizzle-orm/d1";
import * as schema from "../db/schema";
import {HTTPD1Database} from "@/lib/mock-services";
import {D1Database} from "@cloudflare/workers-types";

export const runtime = "edge";

export default function initDbConnection(dbId: string) {
    if (process.env.NODE_ENV === "development") {
        return new HTTPD1Database(schema, dbId);
    }

    return drizzle(process.env.DB as unknown as D1Database, {
        schema
    })
}