"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export const runtime = "edge";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2">
      <Card className="h-fit w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center">Page not found</CardTitle>
          <CardDescription className="text-center mt-2">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Go back
          </button>
          <Link href="/" className="text-sm text-blue-500 hover:text-blue-700">
            Go home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
