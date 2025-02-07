import type {
  MockAi,
  MockR2Bucket,
  MockService,
  MockKVNamespace,
  MockAnalyticsDataset,
} from "../../types/mock-services";
import type { HTTPAIGatewayParams, HTTPAIParams } from "../../types/ai";
import { WorkflowParams } from "@/types/workflow";
const {
  CLOUDFLARE_EMAIL,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
  CLOUDFLARE_KV_API_TOKEN,
  CF_ANALYTICS_TOKEN,
  CLOUDFLARE_AI_API_TOKEN,
  CLOUDFLARE_R2_API_TOKEN,
  CLOUDFLARE_R2_BUCKET_ID,
  CF_WORKER_URL,
  CF_WORKER_TOKEN,
} = process.env;

// MARK: - AI
export class HTTPAi implements MockAi {
  async run(
    model: string,
    params: HTTPAIParams,
    gatewayParams: HTTPAIGatewayParams
  ): Promise<Response> {
    const { id } = gatewayParams;

    const response = await fetch(
      `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${id}/workers-ai/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_AI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );
    return response;
  }
}

// MARK: - D1 Database
// export class MockD1Database implements MockD1Database {
  
//   async insert(table: any) : Promise<any> {
//     console.log("Mock D1 insert:", table);
//     return null;
//   }

//   async query(query: string): Promise<any> {
//     console.log("Mock D1 query:", query);
//     return null;
//   }

//   async delete(query: string): Promise<any> {
//     console.log("Mock D1 delete:", query);
//     return null;
//   }
// }

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
  async put(key: string, value: any, httpMetadata: any): Promise<void> {
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
          "X-Auth-Key": CLOUDFLARE_KV_API_TOKEN!,
        },
      }
    );
    return response.json();
  }
  async put(key: string, value: any): Promise<void> {
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`,
      {
        method: "PUT",
        body: JSON.stringify({
          // metadata: "{\"someMetadataKey\": \"someMetadataValue\"}",
          value: value,
        }),
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Auth-Email": process.env.CLOUDFLARE_EMAIL!,
          "X-Auth-Key": process.env.CLOUDFLARE_KV_API_TOKEN!,
        },
      }
    );
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
  R2: new HTTPR2Bucket(),
  KV: new HTTPKVNamespace(),
  ANALYTICS: new HTTPAnalyticsDataset(),
  BD_WORKFLOW: new HTTPService(),
});
