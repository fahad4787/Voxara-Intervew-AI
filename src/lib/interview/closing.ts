import type { InterviewSession } from "@/types/interview";

/** Tiny client-safe helper — keep out of prompts.ts (avoids shipping the question bank). */
export function buildClosingMessage(session: InterviewSession) {
  return `Thank you, ${session.candidateName}. I really appreciated your thoughtful answers today. You’ve put in good work — we’ll share this with the hiring team. Take care, and goodbye!`;
}
