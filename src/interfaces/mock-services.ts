import {HTTPAIGatewayParams, HTTPAIParams} from "@/types/mock-services";

export interface MockKVNamespace {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
  // Add other KV methods as needed
}

export interface MockAi {
  run(
    model: string,
    params: HTTPAIParams,
    gatewayParams: HTTPAIGatewayParams,
  ): Promise<any>; //<AIRunResponse>;
}
