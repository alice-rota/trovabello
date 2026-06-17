import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

// Choix du modèle IA — 100% GRATUIT.
//
// 1. GROQ_API_KEY → Groq (gratuit, sans CB, limites larges) — RECOMMANDÉ.
// 2. GOOGLE_GENERATIVE_AI_API_KEY → Google Gemini (free tier, quotas stricts).
// 3. AI_GATEWAY_API_KEY → Vercel AI Gateway (payant).
export function getModel(): LanguageModel {
  if (process.env.GROQ_API_KEY) {
    return groq(process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile");
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY || !process.env.AI_GATEWAY_API_KEY) {
    return google(process.env.AI_MODEL ?? "gemini-2.0-flash-lite");
  }
  return (process.env.AI_MODEL ?? "anthropic/claude-sonnet-4-6") as unknown as LanguageModel;
}
