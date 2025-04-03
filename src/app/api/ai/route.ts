import {
    CAPTION_PROMPT,
    IMAGE_PROMPT,
} from "@/server/workflows/ai-workflow/src/constants";
import {auth} from "@/auth";
import {getEnvContext} from "@/lib/getEnvContext";
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
                const prompt = `
                    You are a helpful assistant that generates slide prompts for a deck of images.
                    You will be given a prompt and a number of slides.
                    You will generate ${body.slideCount} prompts for the slides.
                    The prompts should be concise and descriptive for AI image generation. 
                    Here is the prompt: ${body.aiPrompt}
                    The response MUST BE IN the following format.
                    prompt1
                    \n
                    ...
                    No extra commentary or extra words outside of the specified format.
                `;

                const result = await env.AI.run(
                    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
                    // "@cf/meta/llama-3.1-70b-instruct",
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
                            id: "battledecks_ai_gateway",
                            skipCache: true,
                        },
                    }
                );

                return new Response(result, {
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
                    "@cf/meta/llama-3.2-11b-vision-instruct",
                    {
                        prompt: CAPTION_PROMPT,
                        image: uint8Array,
                        stream: true,
                    },
                    {
                        gateway: {
                            id: "battledecks_ai_gateway",
                            skipCache: true,
                        },
                    }
                );

                return new Response(result, {
                    headers: {"content-type": "text/event-stream"},
                });
            }

            case "create_slide_image": {
                const resultImage = await env.AI.run(
                    "@cf/stabilityai/stable-diffusion-xl-base-1.0",
                    {
                        prompt: IMAGE_PROMPT + body.aiPrompt,
                    },
                    {
                        gateway: {
                            id: "battledecks_ai_gateway",
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
