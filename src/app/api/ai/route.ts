import {
    CAPTION_PROMPT,
    GATEWAY,
    IMAGE_MODEL,
    IMAGE_PROMPT,
    makeDeckPrompt,
    TEXT_MODEL,
    VISION_MODEL,
} from "@/server/workflows/ai-workflow/src/constants";
import {auth} from "@/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";
export const dynamic = "force-dynamic"; // This is required to enable streaming

interface RequestBody {
    action:
        | "create_slide_prompts"
        | "create_slide_image"
        | "create_slide_caption";
    aiPrompt: string;
    slideCount: number;
}

export async function POST(request: Request) {
    if (!request.method || request.method !== "POST") {
        return new Response(null, {status: 404});
    }

    const session = await auth();

    if (!session) {
        return new Response(JSON.stringify({error: "Unauthorized"}), {
            status: 401,
        });
    }

    try {
        // const {env} = getEnvContext();
        const {env} = getRequestContext();
        const contentType = request.headers.get("content-type") || "";
        let body: RequestBody;
        let uint8Array;

        // Handle different content types
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();

            // Parse the metadata JSON string
            const metadata = JSON.parse(formData.get("metadata") as string);

            body = {
                action: metadata.action as RequestBody["action"],
                aiPrompt: formData.get("aiPrompt") as string,
                slideCount: Number(formData.get("slideCount")),
            };

            const imageFile = formData.get("file") as File;
            if (imageFile) {
                const arrayBuffer = await imageFile.arrayBuffer();
                uint8Array = [...new Uint8Array(arrayBuffer)];
            }
        } else {
            body = (await request.json()) as RequestBody;
        }

        switch (body.action) {
            case "create_slide_prompts": {
                const prompt = makeDeckPrompt(body.slideCount, body.aiPrompt);

                const result = await env.AI.run(
                    TEXT_MODEL,
                    {
                        prompt,
                        stream: true,
                        temperature: 0.5,
                        top_p: 0.9,
                        frequency_penalty: 1.0,
                        presence_penalty: 1.0,
                    },
                    {
                        gateway: {
                            id: GATEWAY,
                            skipCache: true,
                        },
                    }
                );

                return new Response(result as ReadableStream, {
                    headers: {"content-type": "text/event-stream"},
                });
            }

            case "create_slide_caption": {
                if (!uint8Array) {
                    return new Response(JSON.stringify({error: "No image provided"}), {
                        status: 400,
                        headers: {"Content-Type": "application/json"},
                    });
                }

                const result = await env.AI.run(
                    VISION_MODEL,
                    {
                        prompt: CAPTION_PROMPT,
                        image: uint8Array,
                        stream: true,
                    },
                    {
                        gateway: {
                            id: GATEWAY,
                            skipCache: true,
                        },
                    }
                );

                return new Response(result as ReadableStream, {
                    headers: {"content-type": "text/event-stream"},
                });
            }

            case "create_slide_image": {
                const resultImage = await env.AI.run(
                    IMAGE_MODEL,
                    {
                        prompt: IMAGE_PROMPT + body.aiPrompt,
                    },
                    {
                        gateway: {
                            id: GATEWAY,
                            skipCache: true,
                        },
                    }
                );

                return new Response(resultImage as unknown as ReadableStream, {
                    headers: {"content-type": "image/png"},
                });
            }

            default: {
                const resData = {error: "Invalid action"};
                return new Response(JSON.stringify(resData), {
                    headers: {"Content-Type": "application/json"},
                });
            }
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        return new Response(JSON.stringify({error: "Internal server error"}), {
            status: 500,
            headers: {"Content-Type": "application/json"},
        });
    }
}
