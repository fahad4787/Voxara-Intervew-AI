import type { ReactNode } from "react";

type IconProps = { className?: string };

function IconFrame({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function ClipboardIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 14h6M9 18h4" />
    </IconFrame>
  );
}

function AudioIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M2 10v4M6 7v10M10 4v16M14 7v10M18 10v4M22 12v0" />
    </IconFrame>
  );
}

function VideoIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="m16 10 6-3v10l-6-3" />
    </IconFrame>
  );
}

function SparklesIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="2.5" />
    </IconFrame>
  );
}

/** Landing-only copy + inline SVGs (no lucide on the marketing route). */
export const MARKETING_FEATURES = [
  {
    icon: ClipboardIcon,
    title: "Built from the JD",
    description:
      "Topics and follow-ups come from the role you paste — not a generic question bank.",
  },
  {
    icon: AudioIcon,
    title: "Spoken, not typed",
    description:
      "Ava asks aloud. Candidates answer aloud. The room feels like a real call.",
  },
  {
    icon: VideoIcon,
    title: "One invite link",
    description:
      "Candidates open the room in the browser, consent, and go live with camera on.",
  },
  {
    icon: SparklesIcon,
    title: "Evidence on the score",
    description:
      "Content, confidence, grammar, and clarity — with quotes pulled from the transcript.",
  },
] as const;

export const MARKETING_STEPS = [
  {
    stage: "Open",
    title: "Open from a JD",
    description:
      "Paste the role. Ava drafts topics, an opening, and adaptive follow-ups.",
  },
  {
    stage: "Speak",
    title: "Send them in",
    description:
      "Share one link. They enable mic and camera, then answer out loud.",
  },
  {
    stage: "Score",
    title: "Read the call",
    description:
      "Review the scorecard: what they said, how clearly, with evidence quotes.",
  },
] as const;

export const MARKETING_AUDIENCE = [
  {
    title: "Recruiters",
    description:
      "Screen more candidates without cloning yourself on every first call.",
  },
  {
    title: "Hiring managers",
    description:
      "Walk into debriefs with quotes and scores — not fuzzy memory of the chat.",
  },
  {
    title: "Growing teams",
    description:
      "Keep the bar consistent when volume goes up and interviewer bandwidth does not.",
  },
] as const;

export const MARKETING_SCORE_DIMS = [
  {
    title: "Content",
    description: "Did they actually answer the role — with specifics?",
  },
  {
    title: "Communication",
    description: "Was the answer complete and easy to follow out loud?",
  },
  {
    title: "Confidence",
    description: "Steady delivery vs. hedging through every turn.",
  },
  {
    title: "Grammar",
    description: "Ideas land clearly — not accent or ASR typos.",
  },
  {
    title: "Clarity",
    description: "Thread holds across answers; points finish.",
  },
  {
    title: "Overall",
    description: "One number your team can discuss in the hiring meeting.",
  },
] as const;

export const MARKETING_TRUST = {
  eyebrow: "Built for real hiring",
  title: "Consent first. Evidence after.",
  description:
    "Candidates enable mic and camera in the browser, agree to record, then speak. You get transcript-backed scores — not a black-box vibe check.",
} as const;
