"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { TurnstileState } from "@/types/turnstile-state";
import { headers } from "next/headers";
import { AnalyticsState } from "@/types/analytics";
import { getEnvContext } from "@/lib/getEnvContext";

async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

async function logout() {
  try {
    await signOut();
  } catch (error) {
    throw error;
  }
}

async function submitTurnstile(prevState: TurnstileState, formData: FormData) {
  // Destructure form data
  const cfTurnstileResponse = formData.get("cf-turnstile-response") as string;

  // If using a reverse proxy, ensure the X-Real-IP header is enabled to accurately capture the client's original IP address.
  const ip = (await headers()).get("x-real-ip");

  // Create form data for Turnstile verification
  const verifyFormData = new FormData();
  verifyFormData.append(
    "secret",
    process.env.NEXT_PRIVATE_TURNSTILE_SECRET_KEY
  );
  verifyFormData.append("response", String(cfTurnstileResponse));
  verifyFormData.append("remoteip", String(ip));

  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  try {
    // Verify Turnstile using Cloudflare endpoint
    const result = await fetch(url, {
      body: verifyFormData,
      method: "POST",
    });

    const outcome = (await result.json()) as TurnstileState;
    if (!outcome.success) {
      // Turnstile failed
      return {
        success: false,
        error: true,
        message: "Invalid CAPTCHA",
      };
    }

    // Turnstile success
    return {
      success: true,
      error: false,
      message: "",
    };
  } catch (error) {
    // Request failed
    console.log("submitTurnstile.error", error);
    return {
      success: false,
      error: true,
      message: "Unable to verify CAPTCHA",
    };
  }
}

async function runAnalyticsQuery(
  prevState: AnalyticsState,
  formData: FormData
): Promise<AnalyticsState> {
  try {
    console.log("runAnalyticsQuery.formData", formData);
    const query = formData?.get("query")?.toString();
    const queryType = formData?.get("queryType")?.toString() as "sql" | "graphql";

    // Get current date and 15 days ago in ISO format
    const end = new Date().toISOString().slice(0, 16) + ":00Z";
    const start =
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16) + ":00Z";

    console.log("runAnalyticsQuery.query", query);
    console.log("runAnalyticsQuery.queryType", queryType);

    let payload: object | string;
    let apiEndpoint: string;

    if (!query) {
      return {
        status: "error",
        message: "Query is required",
        queryType: queryType as "sql" | "graphql", // Type cast to valid values
      };
    }

    if (queryType === "graphql") {
      apiEndpoint = "https://api.cloudflare.com/client/v4/graphql";
      payload = JSON.stringify({
        query: query,
        variables: {
          limit: 1000,
          start: start,
          end: end,
        },
      });
    } else {
      apiEndpoint = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/analytics_engine/sql`;
      //pass the SQL directly
      payload = query;
    }

    const res = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CF_ANALYTICS_TOKEN}`,
      },
      body: payload,
    });

    const data = await res.json();
    console.log("runAnalyticsQuery.data", data);

    // Return the query results
    return {
      status: "success",
      message: JSON.stringify(data), // Convert data to string to match AnalyticsState type
      queryType: queryType as "sql" | "graphql",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      queryType: formData?.get("queryType")?.toString() as "sql" | "graphql" || "graphql",
    };
  }
}

async function writeAnalyticsData(params: {
  blobs: string[];
  doubles: number[];
  indexes: string[];
}) {
  // const { env } = await getRequestContext(); //todo: update
  const { env } = getEnvContext();

  
  // console.log("writeAnalyticsData.env", env);
  env.ANALYTICS.writeDataPoint(params);
}

export {
  authenticate,
  logout,
  submitTurnstile,
  runAnalyticsQuery,
  writeAnalyticsData,
};
