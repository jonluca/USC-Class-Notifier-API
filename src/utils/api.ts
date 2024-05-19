/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { loggerLink } from "@trpc/client";
import type { WithTRPCNoSSROptions } from "@trpc/next";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import getLink from "./httpLink";
import type { NextPageContext } from "next";
import type { GetServerSidePropsContext } from "next/types";
import type { AppRouter } from "~/server/api/root";
import { transformer } from "~/server/api/transformer";
import { toast } from "react-toastify";

export const getTrpcConfig = (ctx: NextPageContext | GetServerSidePropsContext | undefined) => {
  // this is going back to a global cache, so we need to be careful - however, now we only serialize requests we've seen,
  // which lets us share the cache between all unauthed requests pretty nicely
  const queryCache = new QueryCache({
    onError: (err, query) => {
      if (err) {
        if (typeof err === "object" && "message" in err) {
          toast.error(`[${query["queryKey"][0]}]: ${err.message as string}`);
        } else {
          toast.error(`[${query["queryKey"][0]}]: ${err}`);
        }
      }
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 15, // 15 minutes
        refetchIntervalInBackground: false,
        networkMode: "always",
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        networkMode: "always",
      },
    },
    queryCache,
  });

  const link = getLink(ctx);

  return {
    /**
     * Links used to determine request flow from client to server.
     *
     * @see https://trpc.io/docs/links
     */
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" || (opts.direction === "down" && opts.result instanceof Error),
      }),
      link,
    ],
    queryClient,
    headers: () => {
      if (ctx?.req) {
        // on ssr, forward client's headers to the server
        return {
          ...ctx.req.headers,
          "x-ssr": "1",
        };
      }
      return {};
    },
  };
};
export const trpcOpts = {
  /**
   * Transformer used for data de-serialization from the server.
   *
   * @see https://trpc.io/docs/data-transformers
   */
  transformer,
  config(opts) {
    return getTrpcConfig(opts.ctx);
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
} satisfies WithTRPCNoSSROptions<AppRouter>;
/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>(trpcOpts);

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
