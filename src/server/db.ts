import "dotenv/config";
import "@/server/logger";
import { PrismaClient } from "@app/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.POSTGRES_PRISMA_URL!,
  keepAlive: true,
  statement_timeout: undefined,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 60_000,
  max: 80,
});

const baseClient = new PrismaClient({
  adapter,
});

export type PrismaClientType = typeof baseClient;
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

export const prisma: PrismaClientType = globalForPrisma.prisma ?? baseClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
