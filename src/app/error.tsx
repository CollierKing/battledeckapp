"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Error() {
  return (
    <main className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2">
      <Card className="h-fit w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center">
            Oops! Something went wrong.
          </CardTitle>
          <CardDescription className="text-center mt-2">
            Sorry, something went wrong. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          <Link href="/" className="text-sm text-blue-500 hover:text-blue-700">
            Go home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
