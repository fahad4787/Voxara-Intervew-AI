import { FILLER_WORDS, HEDGING_PHRASES } from "@/lib/utils/constants";
import type { InterviewMessage, SpeechMetrics } from "@/types/interview";

function countPhrase(text: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "gi");
  return (text.match(regex) || []).length;
}

export function computeSpeechMetrics(
  messages: InterviewMessage[],
): SpeechMetrics {
  const answers = messages.filter((m) => m.role === "candidate");
  const combined = answers.map((a) => a.content).join(" ").toLowerCase();
  const words = combined
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  const fillerWords: Record<string, number> = {};
  let fillerWordCount = 0;

  for (const filler of FILLER_WORDS) {
    const count = countPhrase(combined, filler);
    if (count > 0) {
      fillerWords[filler] = count;
      fillerWordCount += count;
    }
  }

  let hedgingPhraseCount = 0;
  for (const phrase of HEDGING_PHRASES) {
    hedgingPhraseCount += countPhrase(combined, phrase);
  }

  const totalDurationMs = answers.reduce(
    (sum, answer) => sum + (answer.meta?.durationMs || 0),
    0,
  );

  const averageAnswerDurationMs =
    answers.length === 0 ? 0 : Math.round(totalDurationMs / answers.length);

  const averageWordsPerMinute =
    totalDurationMs > 0
      ? Math.round((words.length / totalDurationMs) * 60000)
      : answers.reduce((sum, a) => sum + (a.meta?.wordsPerMinute || 0), 0) /
          Math.max(answers.length, 1) || 0;

  const pauseIndicators = countPhrase(combined, "...") + fillerWordCount;

  return {
    totalWords: words.length,
    fillerWordCount,
    fillerWords,
    averageWordsPerMinute: Math.round(averageWordsPerMinute),
    averageAnswerDurationMs,
    pauseIndicators,
    hedgingPhraseCount,
  };
}

export function enrichCandidateMeta(transcript: string, durationMs = 0) {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const lower = transcript.toLowerCase();
  let fillerWordCount = 0;

  for (const filler of FILLER_WORDS) {
    fillerWordCount += countPhrase(lower, filler);
  }

  const wordsPerMinute =
    durationMs > 0 ? Math.round((words.length / durationMs) * 60000) : 0;

  return {
    durationMs,
    fillerWordCount,
    wordsPerMinute,
  };
}
