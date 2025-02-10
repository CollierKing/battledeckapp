/* eslint-disable @typescript-eslint/no-explicit-any */

// import Cloudflare from "cloudflare";

import type {
  MockAi,
  MockR2Bucket,
  MockService,
  MockKVNamespace,
  MockAnalyticsDataset,
} from "../../types/mock-services";
import type {
  // HTTPAIGatewayParams,
  HTTPAIParams,
} from "../../types/ai";
import type { D1Response } from "@/types/d1";
import { WorkflowParams } from "@/types/workflow";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "@/server/db/schema";
import { AIRunResponse } from "cloudflare/resources/ai/ai.mjs";
const {
  CLOUDFLARE_EMAIL,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
  CF_ANALYTICS_TOKEN,
  CLOUDFLARE_API_KEY,
  // CLOUDFLARE_AI_API_TOKEN,
  CLOUDFLARE_R2_API_TOKEN,
  CLOUDFLARE_R2_BUCKET_ID,
  CF_WORKER_URL,
  CF_WORKER_TOKEN,
  CLOUDFLARE_D1_API_TOKEN,
  CLOUDFLARE_DATABASE_ID,
} = process.env;

// MARK: - AI
export class HTTPAi implements MockAi {
  async run(
    model: string,
    params: HTTPAIParams
    // gatewayParams: HTTPAIGatewayParams
  ): Promise<AIRunResponse> {
    // TODO: something is off/different with the AI Gateway responses
    // const { gateway } = gatewayParams;
    // const { id } = gateway;

    // return await fetch(
    //   `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${id}/workers-ai/${model}`,
    //   // `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Authorization": `Bearer ${CLOUDFLARE_AI_API_TOKEN}`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(params),
    //   }
    // );

    // TODO:
    // This will stream back stuff from the TEXT model
    // However the Vision model will not stream back anything
    // Also the image model will not return anything
    return await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`,
      {
        method: "POST",
        headers: {
          "X-Auth-Email": CLOUDFLARE_EMAIL!,
          "X-Auth-Key": CLOUDFLARE_API_KEY!,
          "Content-Type": "application/json",
          // ...(params.stream && { Accept: "text/event-stream" })
        },
        body: JSON.stringify(params),
      }
    );

    // const client = new Cloudflare({
    //   apiEmail: CLOUDFLARE_EMAIL, // This is the default and can be omitted
    //   apiKey: CLOUDFLARE_API_KEY, // This is the default and can be omitted
    // });

    // return await client.ai.run(model, {
    //   ...params,
    //   account_id: CLOUDFLARE_ACCOUNT_ID
    // });

    // console.log("response", response);
    // return response;
  }
}

// MARK: - D1 Database
// @ts-expect-error HTTP Implementation does not fully support D1Database
export class HTTPD1Database implements D1Database {
  private schema: any;
  private drizzleInstance: any;

  constructor(schema: any) {
    this.schema = schema;
    this.drizzleInstance = drizzle(
      async (sql: string, params: any[], method: string) => {
        if (
          !CLOUDFLARE_ACCOUNT_ID ||
          !CLOUDFLARE_DATABASE_ID ||
          !CLOUDFLARE_D1_API_TOKEN
        ) {
          throw new Error(
            "Missing required Cloudflare D1 environment variables."
          );
        }

        const endpoint = method === "values" ? "raw" : "query";
        const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_DATABASE_ID}/${endpoint}`;
        console.log("url", url);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_D1_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sql, params }),
        });

        if (response.status !== 200) {
          throw new Error(
            `Error from sqlite proxy server: ${response.status} ${
              response.statusText
            }\n${JSON.stringify(await response.json())}`
          );
        }

        const responseJson = (await response.json()) as D1Response;

        if (!responseJson.success) {
          throw new Error(
            `Error from Cloudflare D1: ${response.status} ${
              response.statusText
            }\n${JSON.stringify(responseJson)}`
          );
        }

        const qResult = responseJson.result[0];
        const rows = qResult.results.map((r: any) => Object.values(r));

        return { rows: method === "all" ? rows : rows[0] };
      },
      { schema: this.schema, logger: process.env.NODE_ENV === "development" }
    );
  }

  // Add these new methods to support drizzle-orm operations
  get query() {
    return this.drizzleInstance.query;
  }

  insert(table: any) {
    return this.drizzleInstance.insert(table);
  }

  select(fields?: any) {
    return fields
      ? this.drizzleInstance.select(fields)
      : this.drizzleInstance.select();
  }

  update(table: any) {
    return this.drizzleInstance.update(table);
  }

  delete(table: any) {
    return this.drizzleInstance.delete(table);
  }

  // prepare(query: string): D1PreparedStatement {
  //   return {
  //     bind: (...values: any[]) => ({ query, values }),
  //     first: async () => null,
  //     run: async () => ({ success: true, results: [] }),
  //     all: async () => [],
  //     raw: async () => [],
  //   };
  // }

  // async dump(): Promise<ArrayBuffer> {
  //   throw new Error("Method not implemented in mock.");
  // }

  // async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T> {
  //   return [] as unknown as T;
  // }

  // async exec(query: string): Promise<D1ExecResult> {
  //   return {
  //     meta: {
  //       count: 0,
  //       duration: 0,
  //     },
  //     success: true,
  //   };
  // }
}

// MARK: - R2 Bucket
export class HTTPR2Bucket implements MockR2Bucket {
  async get(key: string): Promise<any> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${CLOUDFLARE_R2_BUCKET_ID}/objects/${key}`,
      {
        method: "GET",
        headers: {
          "X-Auth-Email": CLOUDFLARE_EMAIL!,
          "X-Auth-Key": CLOUDFLARE_R2_API_TOKEN!,
        },
      }
    );
    return response.json();
  }
  async put(key: string, value: any): Promise<void> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${CLOUDFLARE_R2_BUCKET_ID}/objects/${key}`,
      {
        method: "PUT",
        headers: {
          "X-Auth-Email": CLOUDFLARE_EMAIL!,
          "X-Auth-Key": CLOUDFLARE_R2_API_TOKEN!,
        },
        body: JSON.stringify(value),
      }
    );
    return response.json();
  }
}

// MARK: - KV Namespace
export class HTTPKVNamespace implements MockKVNamespace {
  async get(key: string): Promise<any> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`,
      {
        method: "GET",
        headers: {
          "X-Auth-Email": CLOUDFLARE_EMAIL!,
          "X-Auth-Key": CLOUDFLARE_API_KEY!,
        },
      }
    );
    const json = await response.json();
    // console.log("KV response", json);
    return json;
  }
  async put(key: string, value: any): Promise<void> {
    console.log(
      "KV url",
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`
    );
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`,
      {
        method: "PUT",
        body: value,
        headers: {
          "X-Auth-Email": CLOUDFLARE_EMAIL!,
          "X-Auth-Key": CLOUDFLARE_API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );
    // const json = await response.json();
    // console.log("KV response", json);
    // return json;
  }
}

// MARK: - Analytics Dataset
export class HTTPAnalyticsDataset implements MockAnalyticsDataset {
  async runQuery(query: string): Promise<void> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/analytics_engine/sql`,
      {
        method: "POST",
        body: JSON.stringify({
          query: query,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CF_ANALYTICS_TOKEN}`,
        },
      }
    );
    return response.json();
  }

  // TODO: Implement writeDataPoint
  async writeDataPoint(dataPoint: any): Promise<void> {
    console.log("Mock Analytics write:", dataPoint);
  }
}

// MARK: - Service
export class HTTPService implements MockService {
  async workflow(workflowParams: WorkflowParams): Promise<Response> {
    const response = await fetch(CF_WORKER_URL, {
      method: "POST",
      headers: {
        Authorization: CF_WORKER_TOKEN,
      },
      body: JSON.stringify({
        deck_id: workflowParams.deck_id,
        deck_type: workflowParams.deck_type,
      }),
    });
    return response;
  }
}

export const createMockEnv = () => ({
  AI: new HTTPAi(),
  DB: new HTTPD1Database(schema),
  R2: new HTTPR2Bucket(),
  KV: new HTTPKVNamespace(),
  ANALYTICS: new HTTPAnalyticsDataset(),
  BD_WORKFLOW: new HTTPService(),
});
