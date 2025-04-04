import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
  WorkerEntrypoint,
} from "cloudflare:workers";
import readableStreamToBlob from "./utils";
import { CAPTION_PROMPT, GATEWAY, IMAGE_MODEL, IMAGE_PROMPT, VISION_MODEL } from "./constants";

// MARK: - PARAMS
type Env = {
  // Add your bindings here, e.g. Workers KV, D1, Workers AI, etc.
  BD_WORKFLOW: Workflow;
  DB: D1Database;
  AI: Ai;
  R2: R2Bucket;
  CF_STORAGE_DOMAIN: string;
  CF_WORKER_TOKEN: string;
};

// User-defined params passed to your workflow
type Params = {
  deck_id: string;
  deck_type: string;
};

type Slide = {
  id: string;
  deck_id: string;
  deck_order: number;
  caption: string;
  image_url: string;
  wf_status: string;
  createdAt: string;
  updatedAt: string;
};

type RequestBody = {
  instanceId?: string;
  deck_id: string;
  deck_type: string;
};

// MARK: - WORKFLOW
export class BattleDecksWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const payload = event.payload;

    const processSlide = async (
      env: Env,
      deck_type: string,
      deck_id: string
    ) => {
      console.log("processSlide.deck_id", deck_id);
      console.log("processSlide.deck_type", deck_type);

      let sqlSelect;
      let sqlUpdate;
      let slides: D1Result<Slide>;
      const slideParallelLimit = 5

      switch (deck_type) {
        // MARK: - HUMAN
        case "human":
          // pull next unprocessed slides from db
          console.log("Pulling next unprocessed slides");

          sqlSelect = `
                        SELECT * 
                        FROM slides 
                        WHERE deck_id = ?1
                        AND wf_status = 'pending' 
                        ORDER BY deck_order ASC LIMIT ?2
                    `;

          slides = await env.DB.prepare(sqlSelect).bind(deck_id, slideParallelLimit).all<Slide>();
          console.log("Slides to process:", slides.results?.length);

          // if no slides, return false
          if (!slides.results || slides.results.length === 0) {
            // Update deck status to completed
            const sqlUpdate = `
                            UPDATE decks 
                            SET wf_status = 'completed' ,
                            hero_image_url = (
                                SELECT image_url 
                                FROM slides 
                                WHERE deck_id = ?1
                                ORDER BY deck_order ASC LIMIT 1
                            )
                            WHERE id = ?1
                        `;
            await env.DB.prepare(sqlUpdate).bind(deck_id).run();
            return false;
          }

          // Process all slides in parallel
          await Promise.all(
            slides.results.map(async (slide) => {
              const slideImagePath = slide.image_url.split("/").pop() as string;
              
              // pull image from R2
              console.log("Pulling image from R2:", slideImagePath);
              const imageObject = await env.R2.get(slideImagePath);

              if (imageObject === null) return null;
              const fileBlob = await readableStreamToBlob(imageObject.body);
              // Convert blob to base64
              const arrayBuffer = await fileBlob.arrayBuffer();
              const uint8Array = [...new Uint8Array(arrayBuffer)];

              const resultCaption = await env.AI.run(
                VISION_MODEL,
                {
                  prompt: CAPTION_PROMPT,
                  image: uint8Array,
                },
                {
                  gateway: {
                    id: GATEWAY,
                    skipCache: true,
                  },
                }
              );

              // @ts-expect-error Response is not typed
              const { response: responseCaption } = resultCaption;
              console.log("AI response for slide", slide.id, ":", responseCaption);

              // save text, status to db
              const sqlUpdate = `
                            UPDATE slides 
                            SET wf_status = 'completed', 
                            caption = ?1 
                            WHERE id = ?2
                        `;

              await env.DB.prepare(sqlUpdate).bind(responseCaption, slide.id).run();
            })
          );

          return true;

        case "ai":
          // pull ai prompt and next unfinished slides
          console.log("Pulling AI prompts for next unfinished slides");

          sqlSelect = `
                        SELECT *
                        FROM slides 
                        WHERE deck_id = ?1
                        AND wf_status = 'pending' 
                        ORDER BY deck_order ASC LIMIT ?2
                    `;
          slides = await env.DB.prepare(sqlSelect).bind(deck_id, slideParallelLimit).all<Slide>();
          console.log("Slides to process:", slides.results?.length);

          // if no slides, return false
          if (!slides.results || slides.results.length === 0) {
            // Update deck status to completed
            sqlUpdate = `
                            UPDATE decks 
                            SET wf_status = 'completed',
                            hero_image_url = (
                                SELECT image_url 
                                FROM slides 
                                WHERE deck_id = ?1
                                ORDER BY deck_order ASC LIMIT 1
                            )
                            WHERE id = ?1
                        `;
            await env.DB.prepare(sqlUpdate).bind(deck_id).run();
            return false;
          }

          // Process all slides in parallel
          await Promise.all(
            slides.results.map(async (slide) => {
              const deckPrompt = slide.caption;

              // generate image from AI
              console.log("generating image from AI for slide:", slide.id);
              const resultImage = await env.AI.run(
                IMAGE_MODEL,
                {
                  prompt: IMAGE_PROMPT + deckPrompt,
                },
                {
                  gateway: {
                    id: GATEWAY,
                    skipCache: true,
                  },
                }
              );

              const fileName = `${slide.id}.png`;

              // If it's a ReadableStream, we need to read it fully first
              if (resultImage instanceof ReadableStream) {
                console.log("Got a ReadableStream, converting to Blob");
                const response = new Response(resultImage);
                const blob = await response.blob();

                await env.R2.put(fileName, blob, {
                  httpMetadata: {
                    contentType: "image/png",
                  },
                });
              } else {
                console.log("Got direct data, attempting direct upload");
                await env.R2.put(fileName, resultImage, {
                  httpMetadata: {
                    contentType: "image/png",
                  },
                });
              }

              const imageUrl = `${env.CF_STORAGE_DOMAIN}/${fileName}`;

              // save image path to db
              const sqlUpdate = `
                            UPDATE slides 
                            SET wf_status = 'completed', 
                            caption = ?1,
                            image_url = ?2 
                            WHERE id = ?3
                        `;
              await env.DB.prepare(sqlUpdate)
                .bind(deckPrompt, imageUrl, slide.id)
                .run();
            })
          );

          return true;

        default:
          console.error("Invalid deck_type:", deck_type);
          return false;
      }
    };

    let counter = 0;
    while (true) {
      const seguir = await step.do(`processSlide: ${counter}`, () =>
        processSlide(this.env, payload.deck_type, payload.deck_id)
      );

      counter++;

      if (!seguir) {
        break;
      }
    }
  }
}

// MARK: - WORKER (rpc method)
export default class BattleDecksWorker extends WorkerEntrypoint<Env> {
  // Fetch Method
  // async fetch() {
  //   return new Response(null, { status: 404 });
  // }

  async fetch(req: Request): Promise<Response> {
    // check for request type
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    // get headers
    const authHeader = req.headers.get("Authorization");

    // check for token vs env.CF_WORKER_TOKEN
    if (authHeader !== this.env.CF_WORKER_TOKEN) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }


    const { instanceId, deck_id, deck_type } =
      (await req.json()) as RequestBody;

    // Get the status of an existing instance, if provided
    if (instanceId) {
      const instance = await this.env.BD_WORKFLOW.get(instanceId);
      return Response.json({
        status: await instance.status(),
      });
    }

    // Spawn a new instance and return the ID and status
    const instance = await this.env.BD_WORKFLOW.create({
      params: {
        deck_id,
        deck_type,
      },
    });
    return Response.json({
      id: instance.id,
      details: await instance.status(),
    });
  }

  // RPC method
  async workflow(wfParams: {
    instanceId?: string;
    deck_id: string;
    deck_type: string;
  }) {
    const { instanceId, deck_id, deck_type } = wfParams;

    // Get the status of an existing instance, if provided
    if (instanceId) {
      const instance = await this.env.BD_WORKFLOW.get(instanceId);
      return Response.json({
        status: await instance.status(),
      });
    }

    // Spawn a new instance and return the ID and status
    const instance = await this.env.BD_WORKFLOW.create({
      params: {
        deck_id,
        deck_type,
      },
    });
    return Response.json({
      id: instance.id,
      details: await instance.status(),
    });
  }
}