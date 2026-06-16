import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

// Choix du modèle IA - privilégie le 100% GRATUIT.
//
// 1. Si GOOGLE_GENERATIVE_AI_API_KEY est défini → Google Gemini (free tier,
//    clé gratuite sur https://aistudio.google.com, sans carte bancaire).
// 2. Sinon, si AI_GATEWAY_API_KEY est défini → Vercel AI Gateway (payant),
//    via une simple chaîne "provider/model".
//
// Par défaut on utilise Gemini Flash : gratuit, rapide, bon en extraction.
export function getModel(): LanguageModel {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY || !process.env.AI_GATEWAY_API_KEY) {
    return google(process.env.AI_MODEL ?? "gemini-2.0-flash");
  }
  // Repli payant si on a explicitement choisi le Gateway
  return (process.env.AI_MODEL ?? "anthropic/claude-sonnet-4-6") as unknown as LanguageModel;
}
