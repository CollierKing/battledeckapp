import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
  WorkerEntrypoint,
} from "cloudflare:workers";
import readableStreamToBlob from "./utils";
import { CAPTION_PROMPT, IMAGE_PROMPT } from "./constants";

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
      let slide: Slide;
      let slideId: string;
      let slideImagePath: string;

      switch (deck_type) {
        // MARK: - HUMAN
        case "human":
          // pull next unprocessed slide from db
          console.log("Pulling next unprocessed slide");

          sqlSelect = `
                        SELECT * 
                        FROM slides 
                        WHERE deck_id = ?
                        AND wf_status = 'pending' 
                        ORDER BY deck_order ASC LIMIT 1
                    `;

          slides = await env.DB.prepare(sqlSelect).bind(deck_id).all<Slide>();
          console.log("Slides to process:", slides);

          // if no slides, return false
          if (!slides.results || slides.results.length === 0) {
            // Tupdate deck status to completed
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

          slide = slides.results[0];
          slideId = slide.id;
          slideImagePath = slide.image_url.split("/").pop() as string;

          // pull image from R2
          console.log("Pulling image from R2:", slideImagePath);
          const imageObject = await env.R2.get(slideImagePath);

          if (imageObject === null) return null;
          const fileBlob = await readableStreamToBlob(imageObject.body);
          // // Convert blob to base64
          const arrayBuffer = await fileBlob.arrayBuffer();
          const uint8Array = [...new Uint8Array(arrayBuffer)];

          const resultCaption = await env.AI.run(
            // @ts-expect-error WorkersAI model name
            "@cf/meta/llama-3.2-11b-vision-instruct",
            {
              prompt: CAPTION_PROMPT,
              image: uint8Array,
            },
            {
              gateway: {
                id: "battledecks_ai_gateway",
                skipCache: true,
              },
            }
          );

          // @ts-expect-error Response is not typed
          const { response: responseCaption } = resultCaption;
          console.log("AI response:", responseCaption);

          // save text, status to db
          console.log("Updating caption, status for slide:", slideId);

          sqlUpdate = `
                        UPDATE slides 
                        SET wf_status = 'completed', 
                        caption = ?1 
                        WHERE id = ?2
                    `;

          await env.DB.prepare(sqlUpdate).bind(responseCaption, slideId).run();

          return true;

        case "ai":
          // pull ai prompt and next unfinished slide
          console.log("Pulling AI prompt and next unfinished slide");

          sqlSelect = `
                        SELECT *
                        FROM slides 
                        WHERE deck_id = ?
                        AND wf_status = 'pending' 
                        ORDER BY deck_order ASC LIMIT 1
                    `;
          slides = await env.DB.prepare(sqlSelect).bind(deck_id).all<Slide>();
          console.log("Slides to process:", slides);

          // if no slides, return false
          if (!slides.results || slides.results.length === 0) {
            // Tupdate deck status to completed
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

          slide = slides.results[0];
          slideId = slide.id;
          const deckPrompt = slide.caption;

          // generate image from AI
          console.log("generating image from AI");
          const resultImage = await env.AI.run(
            "@cf/stabilityai/stable-diffusion-xl-base-1.0",
            {
              prompt: IMAGE_PROMPT + deckPrompt,
            },
            {
              gateway: {
                id: "battledecks_ai_gateway",
                skipCache: true,
              },
            }
          );

          console.log("Result type:", typeof resultImage);
          const fileName = `${slideId}.png`;

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
            // Handle as before
            await env.R2.put(fileName, resultImage, {
              httpMetadata: {
                contentType: "image/png",
              },
            });
          }

          const imageUrl = `${env.CF_STORAGE_DOMAIN}/${fileName}`;

          // save image path to db
          sqlUpdate = `
                        UPDATE slides 
                        SET wf_status = 'completed', 
                        caption = ?1,
                        image_url = ?2 
                        WHERE id = ?3
                    `;
          await env.DB.prepare(sqlUpdate)
            .bind(deckPrompt, imageUrl, slideId)
            .run();

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
  // no fetching allowed
  async fetch() {
    return new Response(null, { status: 404 });
  }

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

// interface RequestBody {
//   instanceId?: string;
//   deck_id: string;
//   deck_type: string;
// }

// MARK: - WORKER (fetch method)
// export default {
//   async fetch(req: Request, env: Env): Promise<Response> {
//     // check for request type
//     if (req.method !== "POST") {
//       return Response.json({ error: "Method not allowed" }, { status: 405 });
//     }

//     // get headers
//     const authHeader = req.headers.get("Authorization");

//     // check for token vs env.CF_WORKER_TOKEN
//     if (authHeader !== env.CF_WORKER_TOKEN) {
//       return Response.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { instanceId, deck_id, deck_type } =
//       (await req.json()) as RequestBody;

//     // Get the status of an existing instance, if provided
//     if (instanceId) {
//       const instance = await env.BD_WORKFLOW.get(instanceId);
//       return Response.json({
//         status: await instance.status(),
//       });
//     }

//     // Spawn a new instance and return the ID and status
//     const instance = await env.BD_WORKFLOW.create({
//       params: {
//         deck_id,
//         deck_type,
//       },
//     });
//     return Response.json({
//       id: instance.id,
//       details: await instance.status(),
//     });
//   },
// };
