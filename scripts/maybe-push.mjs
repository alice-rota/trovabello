// Crée/synchronise les tables de la base au build, UNIQUEMENT sur Vercel
// et seulement si une URL de base est présente. Sans ça (build local, ou
// pas de base branchée), on ne fait rien : l'app tourne en mode démo.
import { execSync } from "node:child_process";

if (!process.env.VERCEL) {
  console.log("[db] Hors Vercel — db push ignoré.");
  process.exit(0);
}

const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "";

if (!url) {
  console.log("[db] Aucune URL de base — db push ignoré (mode démo).");
  process.exit(0);
}

console.log("[db] Synchronisation du schéma (prisma db push)…");
execSync("npx prisma db push --skip-generate", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});
console.log("[db] Tables prêtes ✓");
