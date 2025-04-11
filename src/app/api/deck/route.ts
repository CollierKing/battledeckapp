import { eq, inArray, like, or, and, exists } from "drizzle-orm";
import initDbConnection from "@/server/db";
import { decksTable, slidesTable } from "@/server/db/schema";
import { auth } from "@/auth";

export const runtime = "edge";

interface RequestBody {
  action:
    | "get_decks"
    | "get_slides"
    | "create_deck"
    | "create_slide"
    | "delete_deck"
    | "get_completed_decks"
    | "delete_slides"
    | "search_decks";
  deck_id?: number;
  deck_status?: string;
  name?: string;
  description?: string;
  slide_ids?: number[];
  slide_filenames?: string[];
  search?: string;
}

interface ResponseData {
  decks: (typeof decksTable.$inferSelect)[];
  slides: (typeof slidesTable.$inferSelect)[];
}


export async function POST(request: Request) {
  if (!request.method || request.method !== "POST") {
    return new Response(null, { status: 404 });
  }

  const session = await auth();

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { user } = session;

  try {

    const db = initDbConnection(process.env.CLOUDFLARE_DATABASE_ID!);
    
    const body = (await request.json()) as RequestBody;

    const resData: ResponseData = {
      decks: [],
      slides: [],
    };

    switch (body.action) {
      case "get_decks":
        try {
          resData.decks = await db
            .select()
            .from(decksTable)
            .where(eq(decksTable.email, user.email));
        } catch (dbError) {
          console.error("Error fetching decks:", dbError);
          return new Response(
            JSON.stringify({ error: "Failed to fetch decks" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        break;

      case "get_completed_decks":
        try {
          resData.decks = await db
            .select()
            .from(decksTable)
            .where(
              and(
                eq(decksTable.wf_status, "completed"),
                eq(decksTable.email, user.email)
              )
            );
        } catch (dbError) {
          console.error("Error fetching decks:", dbError);
          return new Response(
            JSON.stringify({ error: "Failed to fetch decks" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        break;

      case "get_slides":
        if (!body.deck_id) {
          return new Response(
            JSON.stringify({ error: "deck_id is required" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        try {
          // select only from slides table
          resData.slides = await db
            .select({
              id: slidesTable.id,
              deck_id: slidesTable.deck_id,
              deck_status: decksTable.wf_status,
              image_url: slidesTable.image_url,
              caption: slidesTable.caption,
              createdAt: slidesTable.createdAt,
              updatedAt: slidesTable.updatedAt,
              deck_order: slidesTable.deck_order,
              wf_status: slidesTable.wf_status,
            })
            .from(slidesTable)
            .innerJoin(decksTable, eq(slidesTable.deck_id, decksTable.id))
            .where(
              and(
                eq(slidesTable.deck_id, body.deck_id.toString()),
                eq(decksTable.email, user.email)
              )
            );

          // if completed, update deck status to acknowledged
          if (body.deck_status === "completed") {
            await db
              .update(decksTable)
              .set({ wf_status: "acknowledged" })
              .where(
                and(
                  eq(decksTable.id, body.deck_id.toString()),
                  eq(decksTable.email, user.email)
                )
              )
              .returning();
          }
        } catch (dbError) {
          console.error("Error fetching slides:", dbError);
          return new Response(
            JSON.stringify({ error: "Failed to fetch slides" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        break;

      case "delete_deck":
        if (!body.deck_id) {
          return new Response(
            JSON.stringify({ error: "deck_id is required" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        try {
          resData.decks = await db
            .delete(decksTable)
            .where(
              and(
                eq(decksTable.id, body.deck_id.toString()),
                eq(decksTable.email, user.email)
              )
            )
            .returning();

          // delete slides
          await db
            .delete(slidesTable)
            .where(eq(slidesTable.deck_id, body.deck_id.toString()));
        } catch (dbError) {
          console.error("Error deleting deck:", dbError);
          return new Response(
            JSON.stringify({ error: "Failed to delete deck" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        break;

      case "delete_slides":
        try {
          if (!body.slide_ids?.length && !body.deck_id) {
            return new Response(
              JSON.stringify({
                error: "Either slide_ids or deck_id is required",
              }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const deleteQuery = db.delete(slidesTable);

          // Delete specific slides using inArray and ensure they belong to the user's deck
          resData.slides = await deleteQuery
            .where(
              and(
                inArray(
                  slidesTable.id,
                  body.slide_ids.map((id) => id.toString())
                ),
                eq(slidesTable.deck_id, body.deck_id!.toString()),
                exists(
                  db
                    .select()
                    .from(decksTable)
                    .where(
                      and(
                        eq(decksTable.id, body.deck_id!.toString()),
                        eq(decksTable.email, user.email)
                      )
                    )
                )
              )
            )
            .returning();
        } catch (dbError) {
          console.error("Error deleting slides:", dbError);
          return new Response(
            JSON.stringify({ error: "Failed to delete slides" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        break;

      case "search_decks":
        try {
          const results = await db
            .select({
              id: decksTable.id,
              name: decksTable.name,
              ai_prompt: decksTable.ai_prompt,
              hero_image: decksTable.hero_image_url,
              caption: slidesTable.caption,
              slide_image: slidesTable.image_url,
            })
            .from(decksTable)
            .leftJoin(slidesTable, eq(decksTable.id, slidesTable.deck_id))
            .where(
              and(
                or(
                  like(decksTable.name, `%${body.search}%`),
                  like(decksTable.ai_prompt, `%${body.search}%`),
                  like(slidesTable.caption, `%${body.search}%`)
                ),
                eq(decksTable.email, user.email)
              )
            );

          // Group by deck and combine matching captions with their images
          const deckMap = new Map();
          results.forEach((result) => {
            if (!deckMap.has(result.id)) {
              deckMap.set(result.id, {
                id: result.id,
                name: result.name,
                ai_prompt: result.ai_prompt,
                hero_image: result.hero_image,
                matching_captions:
                  result.caption &&
                  result.caption
                    .toLowerCase()
                    .includes(body.search.toLowerCase())
                    ? [
                        {
                          text: result.caption,
                          image_url: result.slide_image,
                        },
                      ]
                    : [],
              });
            } else if (
              result.caption &&
              result.caption.toLowerCase().includes(body.search.toLowerCase())
            ) {
              deckMap.get(result.id).matching_captions.push({
                text: result.caption,
                image_url: result.slide_image,
              });
            }
          });

          resData.decks = Array.from(deckMap.values());
        } catch (dbError) {
          console.error("Error searching decks:", dbError);
          return new Response(
            JSON.stringify({ error: "Failed to search decks" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
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
