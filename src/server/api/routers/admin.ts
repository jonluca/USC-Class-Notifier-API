import type { TRPCRouterRecord } from "@trpc/server";
import { adminProcedure } from "../trpc";
import { z } from "zod/v4";
import { runRefresh } from "@/server/api/controller";

export const adminRouter = {
  refresh: adminProcedure.query(async () => {
    return runRefresh();
  }),
  getUserKey: adminProcedure
    .input(
      z.object({
        email: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email } = input;
      return ctx.prisma.student.findUnique({
        where: {
          email,
        },
      });
    }),
} satisfies TRPCRouterRecord;
