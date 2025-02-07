import { defineConfig } from "drizzle-kit";

const { DB_LOCAL_PATH, CF_ACCOUNT_ID, CF_USER_API_TOKEN, DB_PROD_DATABASE_ID } =
  process.env;

export default DB_LOCAL_PATH
  ? defineConfig({
      schema: "./src/server/db/schema.ts",
      out: "./migrations",
      dialect: "sqlite",
      dbCredentials: {
        url: DB_LOCAL_PATH,
      },
    })
  : defineConfig({
      schema: "./src/server/db/schema.ts",
      out: "./migrations",
      driver: "d1-http",
      dialect: "sqlite",
      dbCredentials: {
        accountId: CF_ACCOUNT_ID!,
        token: CF_USER_API_TOKEN!,
        databaseId: DB_PROD_DATABASE_ID!,
      },
    });
