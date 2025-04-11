import type { Ai, D1Database, R2Bucket, AnalyticsEngineDataset, Service, KVNamespace } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    AI: Ai;
    DB: D1Database;
    R2: R2Bucket;
    BD_WORKFLOW: Service;
    KV: KVNamespace;
    ANALYTICS: AnalyticsEngineDataset;
    Chat: DurableObjectNamespace;
  }
}
