# 💍 Domaines — Mariage de Tom & Nicole

Comparateur de domaines de mariage en **France 🇫🇷** et **Italie 🇮🇹**.

Vous saisissez un domaine (nom, site, contact) → une fiche se crée et **se
remplit toute seule** (photo, capacité, tarifs, traiteur, disponibilités) grâce
à l'IA. Pour ce qui manque, un **email part automatiquement** vers le domaine, et
**les réponses sont analysées** pour compléter la fiche. Un tableau compare tout
et estime le **budget total** selon le nombre d'invités.

## Stack

- **Next.js 16** (App Router) + **React 19** + **Tailwind v4**
- **Prisma 6** + **Postgres** (Neon via Vercel Marketplace)
- **Vercel AI Gateway** (extraction + analyse des emails)
- **Resend** (envoi des emails + webhook pour les réponses entrantes)
- **Vercel Cron** (relance auto des domaines sans réponse)

## Comment ça marche

1. **Ajout** d'un domaine → `POST /api/venues`
2. **Enrichissement IA** : lecture du site web + extraction structurée (`src/lib/enrich.ts`)
3. **Champs manquants** détectés (`ESSENTIAL_FIELDS`) → bouton/email de demande
4. **Email entrant** (réponse du domaine) → `POST /api/email/inbound` → analyse IA → fiche complétée
5. **Relance** hebdo des non-répondants → `GET /api/cron/relance` (lundi 9h)

## Démarrage local

```bash
npm install
cp .env.example .env        # puis remplir les variables
npm run db:push             # crée les tables dans la base Postgres
npm run dev                 # http://localhost:3000
```

### Variables d'environnement (voir `.env.example`)

| Variable | Rôle | Sans elle… |
|---|---|---|
| `DATABASE_URL` | Postgres | l'app ne démarre pas |
| `GOOGLE_GENERATIVE_AI_API_KEY` | enrichissement IA (gratuit) | les fiches se créent mais ne se remplissent pas |
| `RESEND_API_KEY` + `EMAIL_FROM` | envoi d'emails | bouton « Demander les infos » renvoie un aperçu sans envoyer |
| `EMAIL_REPLY_TO` | réponses entrantes | pas d'analyse auto des réponses |
| `CRON_SECRET` | protège le cron | — |

### 💚 100% gratuit

Tout tient dans les paliers gratuits : **Vercel Hobby** (hébergement) ·
**Neon** (Postgres 0,5 Go) · **Resend** (3 000 emails/mois) ·
**Google Gemini** free tier (clé gratuite sans CB sur
[aistudio.google.com/apikey](https://aistudio.google.com/apikey), 1 500
requêtes/jour). Aucune carte bancaire requise.

## Déploiement (Vercel)

1. `git push` sur le repo GitHub.
2. Importer le repo sur Vercel.
3. **Marketplace → Neon** : provisionne Postgres + injecte `DATABASE_URL`.
4. Ajouter `GOOGLE_GENERATIVE_AI_API_KEY` (clé gratuite Google AI Studio).
5. Ajouter `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`.
6. Sur Resend : vérifier le domaine d'envoi + configurer **Inbound** vers
   `https://<ton-app>.vercel.app/api/email/inbound`.
7. Lancer `npm run db:push` (ou `prisma migrate deploy`) une fois la base prête.

## ⚠️ À savoir

- La **dispo** et les **tarifs exacts** ne sont presque jamais publics : l'IA
  pré-remplit le public, le reste vient de la **boucle email**.
- L'envoi d'emails est **manuel par défaut** (bouton par fiche). La relance auto
  ne tourne qu'une fois le cron + Resend configurés. Vérifiez bien les contacts
  avant d'écrire à de vrais domaines.
