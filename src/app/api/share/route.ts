import { getRequestContext } from "@cloudflare/next-on-pages";
import { Slide } from "@/types/slides";
import { auth } from "@/auth";

export const runtime = "edge";

interface RequestBody {
  action: "create_share" | "get_share";
  deck_id?: string;
  slides?: Slide[];
}

export async function POST(request: Request) {
  if (!request.method || request.method !== "POST") {
    return new Response(null, { status: 404 });
  }

  const { env } = getRequestContext();

  const body = (await request.json()) as RequestBody;

  try {
    switch (body.action) {
      case "create_share":
        const session = await auth();
        const { user } = session;

        if (!user.email) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        await env.KV.put(
          body.deck_id,
          JSON.stringify(body.slides),
          {
            expirationTtl: 60 * 60 * 24 * 7, // 7 days
          }
        );
        return new Response(
          JSON.stringify({
            success: true,
            share_url: `${process.env.CF_DOMAIN}/share/${body.deck_id}`,
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );

      case "get_share":
        const shareStr = await env.KV.get(body.deck_id);
        const share: Slide[] = shareStr ? JSON.parse(shareStr) : null;
        if (!share) {
          return new Response(JSON.stringify({ error: "Share not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ slides: share }), {
          headers: { "Content-Type": "application/json" },
        });
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
