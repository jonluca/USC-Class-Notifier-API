import "@/server/logger";
import { PrismaClient } from "@prisma/client";

const baseClient = new PrismaClient();

export type PrismaClientType = typeof baseClient;
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

export const prisma: PrismaClientType = globalForPrisma.prisma ?? baseClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
