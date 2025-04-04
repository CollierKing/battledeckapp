import { v6 as uuidv6 } from "uuid";
import initDbConnection from "@/server/db";
import { decksTable, slidesTable } from "@/server/db/schema";
import { chunkArray, getFileExtension } from "@/lib/utils";
import { auth } from "@/auth";
import {getEnvContext} from "@/lib/getEnvContext";

export const runtime = "edge";

interface ResponseData {
  deck_id: string;
  workflow_id?: string;
}

interface FileMetadata {
  file_name: string;
  id: string;
  type: string;
  caption?: string;
  r2_file_name?: string;
  deck_order?: number;
}

const {
  CF_STORAGE_DOMAIN,
  // , CF_WORKER_URL, CF_WORKER_TOKEN
} = process.env;

export async function POST(request: Request) {
  if (!request.method || request.method !== "POST") {
    return new Response(null, { status: 404 });
  }

  const session = await auth();

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { user } = session;

  try {
    const { env } = getEnvContext();
    const db = initDbConnection(process.env.CLOUDFLARE_DATABASE_ID!);
    // Get the form data
    const formData = await request.formData();

    // Get and parse the metadata (last entry)
    const metadataStr = formData.get("metadata");
    if (!metadataStr || typeof metadataStr !== "string") {
      throw new Error("Missing metadata");
    }
    const metadata = JSON.parse(metadataStr) as {
      action: string;
      name: string;
      type: string;
      aiPrompt: string;
      fileMetadata: FileMetadata[];
      generateCaptions: boolean;
      aiSlidePrompts: string[];
      addSlideDeckId: string;
    };

    const resData: ResponseData = {
      deck_id: "",
    };

    const SLIDE_CHUNK_SIZE = 10;

    switch (metadata.action) {
      case "create_deck":
        let deck_id: string;

        // if we are adding slides to a deck, we need to use the deck id already provided
        if (metadata.addSlideDeckId && metadata.type === "human") {
          deck_id = metadata.addSlideDeckId;
        } else {
          // if we are creating a new deck, we need to generate a new deck id
          deck_id = uuidv6();
        }

        if (metadata.type === "ai") {
          // MARK: - AI Deck

          // Insert deck
          await db.insert(decksTable).values({
            id: deck_id,
            email: user.email,
            name: metadata.name,
            ai_prompt: metadata.aiPrompt,
            hero_image_url: null,
            wf_status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Insert slides
          if (metadata.aiSlidePrompts && metadata.aiSlidePrompts.length > 0) {
            // Maximum bound parameters per query is 100.
            // https://developers.cloudflare.com/d1/platform/limits/

            const slideChunks = chunkArray(
              metadata.aiSlidePrompts,
              SLIDE_CHUNK_SIZE
            );

            for (const chunk of slideChunks) {
              await db.insert(slidesTable).values(
                chunk.map((slidePrompt, index) => ({
                  id: uuidv6(),
                  deck_id: deck_id,
                  deck_order: index,
                  caption: slidePrompt,
                  image_url: null,
                  wf_status: "pending",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }))
              );
            }
          }
        } else {
          // MARK: - Human Deck

          // Get all the files from request
          const files: File[] = [];
          for (const [key, value] of formData.entries()) {
            if (key !== "metadata" && value instanceof File) {
              files.push(value);
            }
          }

          // create the filenames for R2
          metadata.fileMetadata = metadata.fileMetadata.map(
            (fileInfo, idx) => ({
              ...fileInfo,
              deck_order: idx,
              r2_file_name: `${fileInfo.id}${getFileExtension(fileInfo.type)}`,
            })
          );

          // Cloudflare Pages can only perform 5 async requests at a time
          // Split files into chunks of 5
          const FILE_CHUNK_SIZE = 5;
          const fileChunks = chunkArray(files, FILE_CHUNK_SIZE);
          const fileChunksMetadata = chunkArray(
            metadata.fileMetadata,
            FILE_CHUNK_SIZE
          );

          // Send the files to r2
          for (const [chunkIndex, chunk] of fileChunks.entries()) {
            await Promise.all(
              chunk.map(async (file, idx) => {
                const buffer = await file.arrayBuffer();
                const fileName =
                  fileChunksMetadata[chunkIndex][idx].r2_file_name;

                return env.R2.put(fileName, buffer, {
                  httpMetadata: { contentType: file.type },
                }).catch((error) => {
                  console.error(`Failed to upload file ${file.name}:`, error);
                  throw error;
                });
              })
            );
          }

          if (!metadata.addSlideDeckId) {
            // Insert deck
            await db.insert(decksTable).values({
              id: deck_id,
              email: user.email,
              name: metadata.name,
              ai_prompt: metadata.aiPrompt,
              hero_image_url: null,
              wf_status: "pending",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }

          const slideBatches = chunkArray(
            metadata.fileMetadata,
            SLIDE_CHUNK_SIZE
          );

          // Insert all batches in parallel
          await Promise.all(
            slideBatches.map((batch) =>
              db.insert(slidesTable).values(
                batch.map((fileInfo) => ({
                  id: fileInfo.id,
                  deck_id: deck_id,
                  deck_order: fileInfo.deck_order,
                  caption: fileInfo.caption || "",
                  image_url: `${CF_STORAGE_DOMAIN}/${fileInfo.r2_file_name}`,
                  wf_status: "pending",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }))
              )
            )
          );
        }

        // MARK: - Invoke Workflow
        if (
          // If we are not adding one off slides to a deck, we need to invoke the workflow
          !metadata.addSlideDeckId &&
          ((metadata.type === "human" && metadata.generateCaptions) ||
            metadata.type === "ai")
        ) {
          // Fetch method
          // const res = await fetch(CF_WORKER_URL, {
          //   method: "POST",
          //   headers: {
          //     Authorization: CF_WORKER_TOKEN,
          //   },
          //   body: JSON.stringify({
          //     deck_id: deck_id,
          //     deck_type: metadata.type,
          //   }),
          // });

          // TODO: IMPLEMENT
          // Binding method (RPC)
          try {
            // @ts-expect-error Type Property 'workflow' does not exist on type 'WorkerEntrypoint<Env, Params>'.
            const res = await env.BD_WORKFLOW.workflow({
              deck_id: deck_id,
              deck_type: metadata.type,
            });

            const data = await res.json();
            resData.workflow_id = data.id;
          } catch (error) {
            console.error("Workflow error:", error);
            throw error;
          }
        }

        resData.deck_id = deck_id;
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(resData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
