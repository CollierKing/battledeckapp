import {HTTPAIGatewayParams, HTTPAIParams} from "@/types/mock-services";

export interface MockAi {
  run(
    model: string,
    params: HTTPAIParams,
    gatewayParams: HTTPAIGatewayParams,
  ): Promise<any>; //<AIRunResponse>;
}

export interface MockR2Bucket {
  get: (key: string) => Promise<any>;
  put: (key: string, value: any) => Promise<void>;
}

export interface MockAnalyticsDataset {
  runQuery: (query: string) => Promise<any>;
  writeDataPoint: (dataPoint: any) => Promise<void>;
}

export interface MockKVNamespace {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
  // Add other KV methods as needed
}

export interface MockService {
  workflow: (workflowParams: WorkflowParams) => Promise<Response>;
}
