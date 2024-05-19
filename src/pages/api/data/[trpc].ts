import { createNextApiHandler } from "@trpc/server/adapters/next";
import type { NodeHTTPHandlerOptions } from "@trpc/server/adapters/node-http";
import { appRouter, createTRPCContext } from "~/server/api";

// export API handler
const onError: NodeHTTPHandlerOptions<any, any, any>["onError"] =
  process.env.NODE_ENV === "development"
    ? ({ path, error }) => {
        console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
      }
    : undefined;

export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError,
});
