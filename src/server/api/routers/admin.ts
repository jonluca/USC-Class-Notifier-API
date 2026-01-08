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
  addPaidId: adminProcedure
    .input(
      z.object({
        paidIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { paidIds } = input;
      const result = await ctx.prisma.watchedSection.updateMany({
        where: {
          paidId: { in: paidIds },
        },
        data: {
          isPaid: true,
        },
      });
      return { updated: result.count };
    }),
  getStudentByPaidId: adminProcedure
    .input(
      z.object({
        paidId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { paidId } = input;
      return ctx.prisma.watchedSection.findFirst({
        where: {
          paidId,
        },
        include: {
          student: true,
        },
      });
    }),
} satisfies TRPCRouterRecord;
