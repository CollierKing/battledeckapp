import type { HTTPAIGatewayParams, HTTPAIParams } from "./ai";
import { WorkflowParams } from "./workflow";

// Define interfaces for mock services that mirror Cloudflare's types
export interface MockAi {
  run(
    model: string,
    params: HTTPAIParams,
    gatewayParams: HTTPAIGatewayParams
  ): Promise<Response>;
}

export interface MockD1Database {
  query: (query: string) => Promise<any>;
  insert: (query: string) => Promise<any>;
  delete: (query: string) => Promise<any>;
}

export interface MockR2Bucket {
  put: (key: string, value: any, httpMetadata: any) => Promise<void>;
  get: (key: string) => Promise<any>;
  // Add other R2 methods as needed
}

export interface MockService {
  workflow(workflowParams: WorkflowParams): Promise<Response>;
}

export interface MockKVNamespace {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
  // Add other KV methods as needed
}

export interface MockAnalyticsDataset {
  writeDataPoint: (data: any) => Promise<void>;
}

// Extend the global CloudflareEnv to work with both real and mock services
declare global {
  interface CloudflareEnv {
    // AI: Ai | MockAi;
    // DB: D1Database | MockD1Database;
    R2: R2Bucket | MockR2Bucket;
    BD_WORKFLOW: Service | MockService;
    KV: KVNamespace | MockKVNamespace;
    ANALYTICS: AnalyticsEngineDataset | MockAnalyticsDataset;
  }
} 