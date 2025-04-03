import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  let session = await auth();

  // In development mode, create a mock session if none exists
  if (process.env.NODE_ENV === "development" && !session) {
    session = {
      user: {
        email: process.env.CLOUDFLARE_EMAIL || "dev@example.com",
        name: "Development User",
        image: "https://github.com/identicons/development.png"
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  // In development mode, bypass auth checks for all routes except login
  if (process.env.NODE_ENV === "development" && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // If the user is not logged in and trying to access a protected route
  if (!session && !request.nextUrl.pathname.startsWith("/login")) {
    // Redirect to login page
    const loginUrl = new URL("/login", request.url);
    // Add the current path as a callback URL
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and trying to access login page, redirect to home
  if (session && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  } else if (
    // If non admin user is logged in and trying to access analytics page, redirect to home
    session &&
    request.nextUrl.pathname.startsWith("/analytics") &&
    process.env.NEXT_PUBLIC_ADMIN_EMAIL !== session.user.email
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Add routes that require authentication
    "/",
    "/dashboard/:path*",
    "/profile/:path*",
    "/decks/:path*",
    "/login",
    "/analytics",
  ],
};
