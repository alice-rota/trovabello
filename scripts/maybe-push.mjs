// Crée/synchronise les tables de la base au build, UNIQUEMENT sur Vercel
// et seulement si une URL Postgres est présente. Sans ça (build local, ou
// pas de base branchée), on ne fait rien : l'app tourne en mode démo.
import { execSync } from "node:child_process";

if (!process.env.VERCEL) {
  console.log("[db] Hors Vercel — db push ignoré.");
  process.exit(0);
}

// Cherche une URL Postgres quel que soit le nom de la variable (préfixe custom
// possible). Préfère une connexion directe (sans "-pooler") pour le db push.
const isPg = (v) => !!v && /^postgres(ql)?:\/\//.test(v);
const known = [
  process.env.DATABASE_URL_UNPOOLED,
  process.env.POSTGRES_URL_NON_POOLING,
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL,
  process.env.POSTGRES_PRISMA_URL,
];
let url = known.find(isPg);
if (!url) {
  const all = Object.values(process.env).filter(isPg);
  url = all.find((v) => !v.includes("-pooler")) || all[0];
}

if (!url) {
  console.log("[db] Aucune URL Postgres trouvée — db push ignoré (mode démo).");
  console.log(
    "[db] Variables vues:",
    Object.keys(process.env)
      .filter((k) => /DATABASE|POSTGRES|PG|NEON/i.test(k))
      .join(", ") || "(aucune)",
  );
  process.exit(0);
}

console.log("[db] Synchronisation du schéma (prisma db push)…");
execSync("npx prisma db push --skip-generate", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});
console.log("[db] Tables prêtes ✓");
