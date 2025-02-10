/* eslint-disable @typescript-eslint/no-explicit-any */

import type { HTTPAIGatewayParams, HTTPAIParams } from "./ai";
import { WorkflowParams } from "./workflow";
import { AIRunResponse } from "cloudflare/resources/ai/ai.mjs";
// Define interfaces for mock services that mirror Cloudflare's types
export interface MockAi {
  run(
    model: string,
    params: HTTPAIParams,
    gatewayParams: HTTPAIGatewayParams
  ): Promise<AIRunResponse>;
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