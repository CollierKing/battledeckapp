import type {
  MockAi,
  MockR2Bucket,
  MockService,
  MockKVNamespace,
  MockAnalyticsDataset,
} from "../../types/mock-services";

export class HTTPAi implements MockAi {
  async run(
    model: string,
    params: object,
    gateway: object,
    apiUrl: string,
    apiToken: string
  ): Promise<Response> {
    const { userPrompt, systemPrompt, temperature, stream } = params;

    const reqArray = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer${apiToken}`,
      },
      body: JSON.stringify({
        messages: reqArray,
        stream: stream,
        // max_tokens: maxOutputTokens,
        model: model,
        temperature: temperature,
      }),
    };
    return await fetch(apiUrl, options);
  }
}

export class HTTPR2Bucket implements MockR2Bucket {
  async put(key: string, value: any): Promise<void> {
    console.log("Mock R2 put:", key, value);
  }
  async get(key: string): Promise<any> {
    console.log("Mock R2 get:", key);
    return null;
  }
}

export class HTTPKVNamespace implements MockKVNamespace {
  async get(key: string): Promise<any> {
    console.log("Mock KV get:", key);
    return null;
  }
  async put(key: string, value: any): Promise<void> {
    console.log("Mock KV put:", key, value);
  }
}

export class HTTPAnalyticsDataset implements MockAnalyticsDataset {
  async trackEvent(event: string, data: any): Promise<void> {
    console.log("Mock Analytics track:", event, data);
  }
  async writeDataPoint(dataPoint: any): Promise<void> {
    console.log("Mock Analytics write:", dataPoint);
  }
}

export class HTTPService implements MockService {
  async fetch(request: Request): Promise<Response> {
    console.log("Mock Service fetch:", request);
    return new Response("Mock Service response");
  }
}

// Implement other mock services similarly...

export const createMockEnv = () => ({
  AI: new HTTPAi(),
  R2: new HTTPR2Bucket(),
  KV: new HTTPKVNamespace(),
  ANALYTICS: new HTTPAnalyticsDataset(),
  BD_WORKFLOW: new HTTPService(),
  // Initialize other mock services...
});
