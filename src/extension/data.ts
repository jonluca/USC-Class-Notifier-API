import { httpLink } from "@trpc/client";
import type { AppRouter } from "~/server/api";
import { transformer } from "~/server/api/transformer";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: "http://localhost:3000/api/data",
      transformer,
    }),
  ],
});
