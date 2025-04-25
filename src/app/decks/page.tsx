import initDbConnection from "@/server/db";
import { decksTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { Suspense } from "react";
import Decks from "@/components/views/decks";
import Loading from "@/components/ui/loading";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BreadcrumbItem as BCIType } from "@/types/breadcrumb-item";
import Link from "next/link";

export const runtime = "edge";

// Create an async component to handle the data fetching
async function DecksWithData() {
  // Authenticate and fetch data
  const session = await auth();

  const db = initDbConnection(process.env.CLOUDFLARE_DATABASE_ID!);

  const decks = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.email, session.user.email));

  const formattedDecks = decks.map((deck) => ({
    ...deck,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  }));

  console.log("formattedDecks", formattedDecks);
  return <Decks decks={formattedDecks} />;
}

// Main page component
export default function DecksPage() {
  const breadcrumbs: BCIType[] = [
    { type: "link", text: "Home", href: "/" },
    { type: "page", text: "Decks" },
  ];
  return (
    <section>
      <div className="py-4 w-full h-10 pl-4 fixed top-0 z-40 bg-background">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {item.type === "link" ? (
                    <Link
                      className="hover:underline text-muted-foreground"
                      href={item.href!}
                    >
                      {item.text}
                    </Link>
                  ) : (
                    <BreadcrumbPage className="text-muted-foreground">
                      {item.text}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Suspense fallback={<Loading className="mt-16" />}>
        <DecksWithData />
      </Suspense>
    </section>
  );
}
