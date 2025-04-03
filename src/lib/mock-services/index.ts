import {drizzle} from "drizzle-orm/sqlite-proxy";
import {MockAi, MockKVNamespace} from "@/interfaces/mock-services";
import {HTTPAIParams} from "@/types/mock-services";

const {
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_D1_API_TOKEN,
    CLOUDFLARE_AI_API_TOKEN,

    CLOUDFLARE_KV_NAMESPACE_ID,
    CLOUDFLARE_KV_API_TOKEN,
} = process.env;

// MARK: - WorkersAI
export class HTTPAi implements MockAi {
    async run(
        model: string,
        params: HTTPAIParams,
        // gatewayParams: HTTPAIGatewayParams
    ): Promise<any> {
        //Promise<AIRunResponse>
        return await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${CLOUDFLARE_AI_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            },
        );
    }
}

// MARK: - D1 Database
// @ts-expect-error HTTP Implementation does not fully support D1Database
export class HTTPD1Database implements D1Database {
    private schema: any;
    private drizzleInstance: any;
    private dbId: any;

    constructor(schema: any, dbId: any) {
        this.schema = schema;
        this.dbId = dbId;
        this.drizzleInstance = drizzle(
            async (sql: string, params: any[], method: string) => {
                if (!CLOUDFLARE_ACCOUNT_ID || !dbId || !CLOUDFLARE_D1_API_TOKEN) {
                    throw new Error(
                        "Missing required Cloudflare D1 environment variables.",
                    );
                }

                const endpoint = method === "values" ? "raw" : "query";
                const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${dbId}/${endpoint}`;
                console.log("url", url);

                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${CLOUDFLARE_D1_API_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({sql, params}),
                });

                // console.log("response", response);
                // const data = await response.json();        // console.log("data", data);
                if (response.status !== 200) {
                    throw new Error(
                        `Error from sqlite proxy server: ${response.status} ${
                            response.statusText
                        }\n${JSON.stringify(await response.json())}`,
                    );
                }

                const responseJson = (await response.json()) as D1Response;
                // console.log("responseJson", responseJson);

                if (!responseJson.success) {
                    throw new Error(
                        `Error from Cloudflare D1: ${response.status} ${
                            response.statusText
                        }\n${JSON.stringify(responseJson)}`,
                    );
                }

                const qResult = responseJson.result[0];
                // console.log("qResult", qResult);
                const rows = qResult.results.map((r: any) => Object.values(r));
                // console.log("rows", rows);

                return {rows: method === "all" ? rows : rows[0]};
            },
            {schema: this.schema, logger: process.env.NODE_ENV === "development"},
        );
    }

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
}

// MARK: - KV Namespace
export class HTTPKVNamespace implements MockKVNamespace {
    async get(key: string): Promise<any> {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${CLOUDFLARE_KV_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            },
        );
        const text = await response.text(); // Read response as text first
        console.log("Response body:", text);

        try {
            return JSON.parse(text); // Manually parse JSON
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return text;
        }
    }

    async put(key: string, value: any): Promise<void> {
        await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`,
            {
                method: "PUT",
                body: value,
                headers: {
                    Authorization: `Bearer ${CLOUDFLARE_KV_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            },
        );
    }
}

// todo: Analytics
// todo: R2
// todo: Vectorize

export const createMockEnv = () => ({
    AI: new HTTPAi(),
    KV: new HTTPKVNamespace(),
});