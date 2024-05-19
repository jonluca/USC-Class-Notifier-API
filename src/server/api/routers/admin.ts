import type { TRPCRouterRecord } from "@trpc/server";
import { publicProcedure } from "../trpc";
import { prisma } from "~/server/db";
import { z } from "zod";
import { runRefresh } from "~/server/api/controller";

export const adminRouter = {
  refresh: publicProcedure.query(async () => {
    return runRefresh();
  }),
  getTimeseriesForTable: publicProcedure
    .input(
      z.object({
        table: z.string(),
        timeRange: z.string().optional(),
      }),
    )
    .query(async (ctx) => {
      const dailySignups = await prisma.$queryRawUnsafe<
        [
          {
            total_count: bigint;
            this_day: bigint;
            previous_day: bigint;
            change_percentage_day: number;
            this_week: bigint;
            previous_week: bigint;
            change_percentage_week: number;
            this_month: bigint;
            previous_month: bigint;
            change_percentage_month: number;
          },
        ]
      >(`WITH recent_entries
     AS (SELECT count(*) FILTER (WHERE "createdAt" > current_timestamp - interval '24 hours')  AS this_day,
                count(*) FILTER (WHERE "createdAt" > current_timestamp - interval '7 days')    AS this_week,
                count(*) FILTER (WHERE "createdAt" > current_timestamp - interval '30 days')   AS this_month,
                count(*) FILTER (WHERE "createdAt" > current_timestamp - interval '48 hours' AND
                                       "createdAt" <= current_timestamp - interval '24 hours') AS previous_day,
                count(*) FILTER (WHERE "createdAt" > current_timestamp - interval '14 days' AND
                                       "createdAt" <= current_timestamp - interval '7 days')   AS previous_week,
                count(*) FILTER (WHERE "createdAt" > current_timestamp - interval '60 days' AND
                                       "createdAt" <= current_timestamp - interval '30 days')  AS previous_month
         FROM "${ctx.input.table}"),
 total_users AS (SELECT count(*) AS total_count
                 FROM "${ctx.input.table}")
SELECT t.total_count,
       r.this_day,
       r.previous_day,
       CASE
           WHEN r.this_day = 0 THEN NULL
           ELSE (r.this_day - r.previous_day)::decimal / r.previous_day * 100
           END AS change_percentage_day,
       r.this_week,
       r.previous_week,
       CASE
           WHEN r.previous_week = 0 THEN NULL
           ELSE (r.this_week - r.previous_week)::decimal / r.previous_week * 100
           END AS change_percentage_week,
       r.this_month,
       r.previous_month,
       CASE
           WHEN r.previous_month = 0 THEN NULL
           ELSE (r.this_month - r.previous_month)::decimal / r.previous_month * 100
           END AS change_percentage_month
FROM recent_entries r,
     total_users t;`);

      const entry = dailySignups[0];
      // convert all values to Numbers instead of BigInts
      return Object.fromEntries(Object.entries(entry).map(([key, value]) => [key, Number(value)]));
    }),
  getJobStatuses: publicProcedure.query(async (ctx) => {
    const dailySignups = await prisma.$queryRawUnsafe<
      [
        {
          jobType: string;
          status: string;
          totalJobs: bigint;
        },
      ]
    >(`SELECT 'AiCoverJob' AS "jobType", "status", COUNT(*) AS "totalJobs"
FROM "AiCoverJob"
GROUP BY "status"
UNION ALL
SELECT 'AiSongJob' AS "jobType", "status", COUNT(*) AS "totalJobs"
FROM "AiSongJob"
GROUP BY "status"
UNION ALL
SELECT 'AiImageJob' AS "jobType", "status", COUNT(*) AS "totalJobs"
FROM "AiImageJob"
GROUP BY "status"
UNION ALL
SELECT 'AiVerificationJob' AS "jobType", "status", COUNT(*) AS "totalJobs"
FROM "AiVerificationJob"
GROUP BY "status";
`);

    // convert all values to Numbers instead of BigInts
    return dailySignups.map((entry) =>
      Object.fromEntries(Object.entries(entry).map(([key, value]) => [key, Number(value)])),
    );
  }),
} satisfies TRPCRouterRecord;
