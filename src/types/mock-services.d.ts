// Define interfaces for mock services that mirror Cloudflare's types
export interface MockAi {
  run: (prompt: string) => Promise<string>;
}

// export interface MockD1Database {
//   prepare(query: string): Promise<D1PreparedStatement>;
//   batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
//   exec(query: string): Promise<D1Result<unknown>>;
//   run(query: string, values?: unknown[]): Promise<D1Result<unknown>>;
//   all<T = unknown>(query: string, values?: unknown[]): Promise<T[]>;
//   first<T = unknown>(query: string, values?: unknown[]): Promise<T | null>;
// }

export interface MockR2Bucket {
  put: (key: string, value: any) => Promise<void>;
  get: (key: string) => Promise<any>;
  // Add other R2 methods as needed
}

export interface MockService {
  fetch: (request: Request) => Promise<Response>;
  // TODO: add workflow method
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
    AI: Ai | MockAi;
    DB: D1Database;
    R2: R2Bucket | MockR2Bucket;
    BD_WORKFLOW: Service | MockService;
    KV: KVNamespace | MockKVNamespace;
    ANALYTICS: AnalyticsEngineDataset | MockAnalyticsDataset;
  }
} 