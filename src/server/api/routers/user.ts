import type { TRPCRouterRecord } from "@trpc/server";
import { publicProcedure, publicProcedureWithUser } from "../trpc";
import { z } from "zod/v4";
import { v4 as uuid } from "uuid";
import { verificationEmail } from "@/emails/processors/verificationEmail";

import { getCurrentSemester } from "@/utils/semester";
import { validDepartments } from "@/utils/validDepartments";
import { nowWatchingEmail } from "@/emails/processors/nowWatchingEmail";
import { prisma } from "@/server/db";
function generateRandom8DigitNumber(): number {
  const min = 10000000;
  const max = 99999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export const userRouter = {
  verifyByKey: publicProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.student.findFirst({
        where: {
          verificationKey: input.key,
        },
      });
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      await ctx.prisma.student.update({
        where: {
          id: user.id,
        },
        data: {
          validAccount: true,
        },
      });

      return {
        success: true,
        message: "Verification successful",
      };
    }),
  hasUser: publicProcedure.query(async ({ ctx }) => {
    return Boolean(ctx.user);
  }),
  getDepartments: publicProcedure.query(async () => {
    return validDepartments;
  }),
  getWatchedClasses: publicProcedureWithUser.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) {
      throw new Error("User not found");
    }
    return ctx.prisma.watchedSection.findMany({
      where: {
        studentId: user.id,
      },
      include: {
        ClassInfo: true,
      },
    });
  }),
  getUserInfo: publicProcedureWithUser.query(async ({ ctx }) => {
    const user = ctx.user;
    return user;
  }),
  addWatchedClass: publicProcedure
    .input(
      z.object({
        sectionNumber: z.string(),
        email: z.string().email(),
        department: z.string(),
        phone: z.string().optional(),
        uscId: z.string().optional(),
        semester: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let student = await ctx.prisma.student.findUnique({
        where: {
          email: input.email,
        },
      });
      if (!student) {
        // create user
        student = await ctx.prisma.student.create({
          data: {
            email: input.email,
            verificationKey: uuid(),
            uscID: input.uscId,
          },
        });
      }
      // now check if this student is already watching this section
      const section = await ctx.prisma.watchedSection.findFirst({
        where: {
          section: input.sectionNumber,
          studentId: student.id,
          semester: input.semester || getCurrentSemester(),
        },
      });
      const showVenmoInfo = Boolean(student.phone || input.phone);

      if (section) {
        if (section.notified) {
          await ctx.prisma.watchedSection.update({
            where: {
              id: section.id,
            },
            data: {
              notified: false,
            },
          });
        }
        return {
          ...section,
          alreadyWatching: true,
          isVerifiedAccount: student.validAccount,
          showVenmoInfo,
          email: input.email,
        };
      }

      // generate 20 random 8 digit numbers
      const randoms = Array.from({ length: 20 }, () => generateRandom8DigitNumber()).map(String);
      const sections = await ctx.prisma.watchedSection.findMany({
        where: {
          paidId: {
            in: randoms,
          },
        },
        select: { paidId: true },
      });
      const existing = new Set(sections.map((s) => s.paidId));
      const paidId = randoms.find((r) => !existing.has(r));

      if (!paidId) {
        throw new Error("Please try again later. We are currently at capacity.");
      }

      const semester = input.semester || getCurrentSemester();

      const classInfo = await ctx.prisma.classInfo.findFirst({
        where: {
          section: input.sectionNumber,
          semester,
        },
      });
      const created = await ctx.prisma.watchedSection.create({
        data: {
          section: input.sectionNumber,
          studentId: student.id,
          phoneOverride: input.phone,
          semester,
          paidId,
          classInfoId: classInfo?.id || null,
        },
        include: {
          ClassInfo: true,
        },
      });
      await prisma.$queryRawUnsafe(`UPDATE "WatchedSection" ws
SET "classInfoId" = ci.id
FROM "ClassInfo" ci
WHERE ws."classInfoId" is null and ws.section = ci.section AND ws.semester = ci.semester;`);
      await nowWatchingEmail({
        verificationKey: student.verificationKey,
        email: student.email,
        sectionEntry: created,
        classInfo: created.ClassInfo || null,
        showVenmoInfo,
      });
      return {
        ...created,
        alreadyWatching: false,
        isVerifiedAccount: student.validAccount,
        showVenmoInfo,
        email: input.email,
      };
    }),

  continueReceivingNotificationsForSection: publicProcedureWithUser
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.prisma.watchedSection.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!section) {
        throw new Error("Section not found");
      }
      await ctx.prisma.watchedSection.update({
        where: {
          id: section.id,
        },
        data: {
          notified: false,
        },
      });
    }),
  setAccountLevelPhoneToAllSections: publicProcedureWithUser.mutation(async ({ ctx }) => {
    await ctx.prisma.watchedSection.updateMany({
      where: {
        studentId: ctx.user.id,
      },
      data: {
        phoneOverride: ctx.user.phone,
      },
    });
  }),
  changePhoneNumberForSection: publicProcedureWithUser
    .input(
      z.object({
        id: z.string(),
        phoneNumber: z.string().length(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.prisma.watchedSection.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!section) {
        throw new Error("Section not found");
      }
      await ctx.prisma.watchedSection.update({
        where: {
          id: section.id,
        },
        data: {
          phoneOverride: input.phoneNumber,
        },
      });
    }),
  changePhoneNumberForAccount: publicProcedure
    .input(
      z.object({
        phoneNumber: z.string().length(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("User not found");
      }
      await ctx.prisma.student.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          phone: input.phoneNumber,
        },
      });
    }),
  sendLoginEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let student = await ctx.prisma.student.findUnique({
        where: {
          email: input.email,
        },
      });
      if (!student) {
        // create user
        student = await ctx.prisma.student.create({
          data: {
            email: input.email,
            verificationKey: uuid(),
          },
        });
      }
      const isVerifiedAlready = student.validAccount;
      await verificationEmail({ email: student.email, isVerifiedAlready, key: student.verificationKey });
      // send email
    }),
  updatePhoneNumberForUser: publicProcedureWithUser
    .input(
      z.object({
        key: z.string(),
        phoneNumber: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.student.update({
        where: {
          id: ctx.user!.id,
        },
        data: {
          phone: input.phoneNumber,
        },
      });
    }),
} satisfies TRPCRouterRecord;
