import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING,
  },
});
