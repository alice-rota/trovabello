import { PrismaClient } from "@prisma/client";

// Résout l'URL de la base quel que soit le nom de variable injecté par
// l'intégration Vercel/Neon (DATABASE_URL, version non-poolée, POSTGRES_URL...).
// On préfère une connexion directe (non-poolée) : plus simple et fiable pour
// une petite app, sans souci de PgBouncer/prepared statements.
const resolvedDbUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "";
if (resolvedDbUrl) process.env.DATABASE_URL = resolvedDbUrl;

// Singleton Prisma - évite d'épuiser les connexions en dev (hot reload)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
