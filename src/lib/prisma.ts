import { PrismaClient } from "@prisma/client";

// Résout l'URL de la base quel que soit le nom de variable injecté par
// l'intégration Vercel/Neon (même avec un préfixe custom). On cherche d'abord
// les noms connus, sinon on scanne toutes les variables à la recherche d'une
// URL Postgres. On préfère une connexion directe (sans "-pooler").
function resolveDbUrl(): string {
  const isPg = (v?: string): v is string =>
    !!v && /^postgres(ql)?:\/\//.test(v);
  const known = [
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
  ];
  for (const v of known) if (isPg(v)) return v;
  const all = Object.values(process.env).filter(isPg);
  return all.find((v) => !v.includes("-pooler")) || all[0] || "";
}
const resolvedDbUrl = resolveDbUrl();
if (resolvedDbUrl) process.env.DATABASE_URL = resolvedDbUrl;

// Singleton Prisma - évite d'épuiser les connexions en dev (hot reload)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
