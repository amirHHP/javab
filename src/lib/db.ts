import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// SQLite databases require absolute paths under Next.js runtime because relative paths
// in schema.prisma resolve relative to the compiled server files instead of the project root.
const isServer = typeof window === "undefined";
const dbUrl = isServer
  ? `file:${path.join(process.cwd(), "prisma/dev.db")}`
  : undefined;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    dbUrl
      ? {
          datasources: {
            db: {
              url: dbUrl,
            },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
