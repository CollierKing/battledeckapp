import { getRequestContext } from "@cloudflare/next-on-pages";
import { createMockEnv } from "./mock-services";

export function getEnvContext() {
  if (process.env.NODE_ENV === "development") {
    return {
      env: createMockEnv(),
      cf: {},
      ctx: {},
    };
  }

  return getRequestContext();
}