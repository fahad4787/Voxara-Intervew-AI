import {
  AudioLines,
  ClipboardCheck,
  Link2,
  Sparkles,
  Video,
} from "lucide-react";

export const APP_NAME = "Voxara";
export const APP_TAGLINE = "Voice-first AI interviews";
export const APP_DESCRIPTION =
  "Run consistent, JD-based video interviews where AI asks spoken questions, adapts in real time, and scores communication with clarity — not accent bias.";

export const MARKETING_FEATURES = [
  {
    icon: ClipboardCheck,
    title: "JD-aware questions",
    description:
      "Paste a job description and the AI builds a tailored interview plan with follow-ups.",
  },
  {
    icon: AudioLines,
    title: "Human-like voice",
    description:
      "Ava asks questions aloud, listens to answers, and responds conversationally.",
  },
  {
    icon: Video,
    title: "Video interview room",
    description:
      "Candidates join from a link, enable camera/mic, and complete the session in-browser.",
  },
  {
    icon: Sparkles,
    title: "Scored feedback",
    description:
      "Get content, confidence, grammar, and clarity insights with evidence quotes.",
  },
] as const;

export const MARKETING_STEPS = [
  {
    icon: ClipboardCheck,
    title: "Create from a JD",
    description:
      "Paste the role description. The AI generates topics, opening, and adaptive questions.",
  },
  {
    icon: Link2,
    title: "Share an invite",
    description:
      "Send one link. Candidates consent, enable camera, and join the live room.",
  },
  {
    icon: Sparkles,
    title: "Review the scorecard",
    description:
      "Get scored feedback on content, confidence, grammar, and clarity with evidence.",
  },
] as const;

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

export const DEFAULT_DURATION_MINUTES = 20;
export const MAX_MESSAGES = 40;
export const MIN_JOB_DESCRIPTION_LENGTH = 40;

export const DIFFICULTY_OPTIONS = [
  { value: "junior", label: "Junior / Intern" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
] as const;
