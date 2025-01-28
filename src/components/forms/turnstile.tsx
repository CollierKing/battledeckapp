"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useActionState } from "react";
import { TurnstileState } from "@/types/turnstile-state";
import { submitTurnstile } from "@/server/actions";
import { Button } from "../ui/button";

// For global callback
declare global {
  interface Window {
    turnstileCallback?: (token: string) => void;
  }
}

const initialState: TurnstileState = {
  success: false,
  error: false,
  message: "",
};

interface TurnstileProps {
  response: (value: boolean | React.ReactNode) => void;
}

export const Turnstile: React.FC<TurnstileProps> = ({ response }) => {
  const [state, formAction] = useActionState(submitTurnstile, initialState);

  // Tracks whether the user has solved the client-side puzzle
  const [isHuman, setIsHuman] = useState(false);

  // Tracks if we've rendered on the client yet
  const [hasMounted, setHasMounted] = useState(false);

  // Set hasMounted to true on the client (after first render),
  // ensuring SSR and client markup match until then.
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Attach our client-side Turnstile callback
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.turnstileCallback = (token: string) => {
        // Mark locally that the user solved the puzzle
        console.log("Turnstile.token", token);
        setIsHuman(true);
      };
    }
  }, []);

  // Listen for successful server verification
  useEffect(() => {
    if (state.success) {
      response(true);
    }
  }, [state.success, response]);

  // While SSR/hydration is happening, render a fixed "Loading" state
  // so we match on server & client. That avoids disabled={null} vs. disabled={true}.
  if (!hasMounted) {
    return (
      <form className="flex flex-col items-center justify-center">
        <Button
          type="button"
          disabled
          className="bg-transparent text-primary hover:bg-secondary dark:hover:bg-gray-900"
        >
          Loading Turnstile...
        </Button>
      </form>
    );
  }

  return (
    <form
      className="flex flex-col items-center justify-center"
      action={formAction}
    >
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      />

      {/* Cloudflare Turnstile element */}
      <div
        className="cf-turnstile"
        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        data-callback="turnstileCallback"
      />

      {/* Disable the button until user completes the challenge */}
      <Button
        type="submit"
        disabled={!isHuman}
        className="bg-transparent text-primary hover:bg-secondary dark:hover:bg-gray-900"
      >
        Proceed
      </Button>
    </form>
  );
};

export default Turnstile;
