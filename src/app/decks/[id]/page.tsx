import initDbConnection from "@/server/db";
import { decksTable, slidesTable } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { Suspense } from "react";
import Slides from "@/components/views/slides";
import Loading from "@/components/ui/loading";
import {
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BreadcrumbItem as BCIType } from "@/types/breadcrumb-item";
import Link from "next/link";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Create an async component to handle the data fetching
async function SlidesWithData({ deckId }) {

  // Authenticate and fetch data
  const session = await auth();

  const db = initDbConnection(process.env.CLOUDFLARE_DATABASE_ID!);

  const slides = await db
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
        eq(slidesTable.deck_id, deckId),
        eq(decksTable.email, session.user.email)
      )
    );

  if (slides.length > 0) {
    // if the deck is completed, update the deck status to acknowledged
    if (slides[0].deck_status === "completed") {
      await db
        .update(decksTable)
        .set({ wf_status: "acknowledged" })
        .where(
          and(
            eq(decksTable.id, deckId),
            eq(decksTable.email, session.user.email)
          )
        );
      // .returning();
      slides[0].wf_status = "acknowledged";
    }
  }

  const formattedSlides = slides.map((slide) => ({
    ...slide,
    createdAt: slide.createdAt.toISOString(),
    updatedAt: slide.updatedAt.toISOString(),
  }));

  return <Slides slides={formattedSlides} deckId={deckId} />;
}

// Main page component
export default async function SlidesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: deckId } = await params;
  const breadcrumbs: BCIType[] = [
    { type: "link", text: "Home", href: "/" },
    { type: "link", text: "Decks", href: "/decks" },
    { type: "page", text: deckId },
    { type: "page", text: `Slides` },
  ];

  return (
    <section>
      <div className="py-4 w-full h-10 pl-4 fixed top-0 z-50 bg-background">
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                {item.type === "link" ? (
                  <Link
                    className="hover:underline text-muted-foreground"
                    href={item.href!}
                  >
                    {item.text.slice(0, 10)}
                  </Link>
                ) : (
                  <BreadcrumbPage className="text-muted-foreground ">
                    {item.text.length > 10
                      ? item.text.slice(0, 10) + "..."
                      : item.text}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </div>
          ))}
        </BreadcrumbList>
      </div>
      <Suspense fallback={<Loading className="mt-16" />}>
        <SlidesWithData deckId={deckId} />
      </Suspense>
    </section>
  );
}
