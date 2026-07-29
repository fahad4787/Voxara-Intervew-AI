export const APP_NAME = "Voxara";
export const APP_TAGLINE = "Voice-first AI interviews";
export const APP_DESCRIPTION =
  "Paste a job description. Ava asks out loud, listens live, and leaves you a scorecard on what was said — not how polished the accent sounded.";

export const AUTH_HIGHLIGHTS = [
  "JD-based interview plans in minutes",
  "Voice questions with live follow-ups",
  "Scored reports your team can trust",
] as const;

export const FILLER_WORDS = [
  "um",
  "uh",
  "erm",
  "ah",
  "like",
  "you know",
  "sort of",
  "kind of",
  "basically",
  "actually",
  "literally",
] as const;

export const HEDGING_PHRASES = [
  "i think",
  "i guess",
  "maybe",
  "probably",
  "not sure",
  "i'm not sure",
  "kind of",
  "sort of",
] as const;

export const DEFAULT_DURATION_MINUTES = 10;
export const MAX_MESSAGES = 40;
export const MIN_JOB_DESCRIPTION_LENGTH = 40;

export const DURATION_OPTIONS = [
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 20, label: "20 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
] as const;

/** Soft max candidate answers before time-based wrap-up, scaled by duration. */
export function maxAnswersForDuration(durationMinutes: number) {
  return Math.max(3, Math.min(12, Math.ceil(durationMinutes / 2.2) + 1));
}

export const DIFFICULTY_OPTIONS = [
  { value: "junior", label: "Junior / Intern" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
] as const;
