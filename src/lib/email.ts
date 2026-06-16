import { Resend } from "resend";
import { FIELD_LABELS } from "./schema";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Adresse d'envoi (doit appartenir à un domaine vérifié sur Resend).
// Le reply-to peut pointer vers une boîte qui alimente le webhook entrant.
const FROM = process.env.EMAIL_FROM ?? "Mariage Nicole et Tom <onboarding@resend.dev>";
const REPLY_TO = process.env.EMAIL_REPLY_TO;

export type SendInfoRequestArgs = {
  venueId: string;
  venueName: string;
  to: string;
  missing: string[]; // clés de champs manquants
  targetDate?: string;
  guests?: number;
};

// Construit le corps de l'email de demande d'informations.
export function buildInfoRequestEmail(a: SendInfoRequestArgs): {
  subject: string;
  text: string;
} {
  const questions = a.missing
    .map((k) => `  • ${FIELD_LABELS[k] ?? k}`)
    .join("\n");

  const subject = `Demande d'informations - mariage ${a.targetDate ? `(${a.targetDate})` : ""}`.trim();

  const text = `Bonjour,

Nous organisons notre mariage${a.guests ? ` pour environ ${a.guests} invités` : ""}${
    a.targetDate ? ` autour du ${a.targetDate}` : ""
  } et votre domaine "${a.venueName}" nous intéresse beaucoup.

Afin de comparer sereinement, pourriez-vous nous préciser :

${questions}

Un grand merci d'avance pour votre retour.
Bien cordialement,
Nicole et Tom

- (Réf. ${a.venueId}) -`;

  return { subject, text };
}

export async function sendInfoRequest(a: SendInfoRequestArgs): Promise<{
  ok: boolean;
  id?: string;
  error?: string;
  preview?: { subject: string; text: string };
}> {
  const { subject, text } = buildInfoRequestEmail(a);

  if (!resend) {
    // Pas de clé configurée : on renvoie un aperçu sans envoyer.
    return { ok: false, error: "RESEND_API_KEY manquante", preview: { subject, text } };
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: a.to,
    replyTo: REPLY_TO,
    subject,
    text,
    // En-tête custom pour rattacher la réponse à la bonne fiche
    headers: { "X-Venue-Id": a.venueId },
  });

  if (error) return { ok: false, error: error.message, preview: { subject, text } };
  return { ok: true, id: data?.id };
}
