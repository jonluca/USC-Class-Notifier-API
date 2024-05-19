import type { TRPCRouterRecord } from "@trpc/server";
import { publicProcedure, publicProcedureWithUser } from "../trpc";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { verificationEmail } from "~/emails/processors/verificationEmail";

import { getSemester } from "~/utils/semester";
import { validDepartments } from "~/utils/validDepartments";
import { nowWatchingEmail } from "~/emails/processors/nowWatchingEmail";
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
      };
    }),
  hasUser: publicProcedure.query(async ({ ctx, input }) => {
    return Boolean(ctx.user);
  }),
  getDepartments: publicProcedure.query(async ({ ctx, input }) => {
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
        courseid: z.string().optional(),
        department: z.string(),
        phone: z.string().optional(),
        uscId: z.string().optional(),
        semester: z.string().optional(),
        fullCourseId: z.string(),
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
        },
      });
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
        return section;
      }

      // generate 20 random 8 digit numbers
      const randoms = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100000000)).map(String);
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

      const semester = input.semester || getSemester();
      const created = await ctx.prisma.watchedSection.create({
        data: {
          section: input.sectionNumber,
          student: { connect: { id: student.id } },
          phoneOverride: input.phone,
          semester,
          paidId,
          ClassInfo: {
            connect: {
              section_semester: {
                semester,
                section: input.sectionNumber,
              },
            },
          },
        },
        include: {
          ClassInfo: true,
        },
      });
      await nowWatchingEmail({
        key: student.verificationKey,
        email: student.email,
        sectionEntry: created,
        classInfo: created.ClassInfo || null,
      });
      return created;
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
  setAccountLevelPhoneToAllSections: publicProcedureWithUser.mutation(async ({ ctx, input }) => {
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
