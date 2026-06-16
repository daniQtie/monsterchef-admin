/**
 * EmailJS wrapper for sending student score notifications.
 *
 * Setup (one-time, in https://emailjs.com):
 *   1. Sign up and connect an Email Service (Gmail recommended).
 *   2. Create a Template with these variables (use {{var}} in the template body):
 *        to_email, to_name, recipe, score, stars, errors, time_minutes,
 *        teacher_name, teacher_note
 *   3. Copy the Service ID, Template ID, and Public Key.
 *   4. Add the three keys to .env.local (and to Vercel project env vars):
 *        NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
 *        NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=...
 *        NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
 *
 * If the env vars are missing, sendScoreEmail() resolves to
 *   { ok: false, reason: "not-configured" }
 * so the rest of the flow (Firestore release) keeps working.
 */

import emailjs from "@emailjs/browser";

export interface ScoreEmailParams {
  to_email: string;
  to_name: string;
  recipe: string;
  score: number;
  stars: number;            // 0..3
  stars_visual: string;     // e.g. "★★☆" — pre-rendered for the email template
  errors: number;
  time_minutes: string;     // pre-formatted "2.5"
  teacher_name: string;
  teacher_note: string;
  has_note: string;         // "yes" | "no" — for template show/hide via {{has_note}}
  recipe_emoji: string;     // small decorative icon per recipe
}

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "missing-email" | "error"; message?: string };

const SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export const isEmailConfigured = () =>
  Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export async function sendScoreEmail(params: ScoreEmailParams): Promise<SendResult> {
  if (!params.to_email) return { ok: false, reason: "missing-email" };
  if (!isEmailConfigured()) return { ok: false, reason: "not-configured" };

  try {
    await emailjs.send(
      SERVICE_ID as string,
      TEMPLATE_ID as string,
      params as unknown as Record<string, unknown>,
      { publicKey: PUBLIC_KEY as string }
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: "error", message: e instanceof Error ? e.message : String(e) };
  }
}
