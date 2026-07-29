import { z } from "zod";
import {
  getInterviewModel,
  getOpenAI,
} from "@/lib/openai/client";
import {
  buildAnalysisSystemPrompt,
  buildAnalysisUserPrompt,
  buildPlanSystemPrompt,
  buildPlanUserPrompt,
  buildTurnSystemPrompt,
} from "@/lib/openai/prompts";
import type {
  CreateInterviewInput,
  InterviewPlan,
  InterviewReport,
  InterviewSession,
  InterviewFeedback,
  InterviewScores,
} from "@/types/interview";
import { computeSpeechMetrics } from "@/lib/analysis/speech-metrics";

const planSchema = z.object({
  topics: z.array(z.string()).min(2),
  questions: z.array(z.string()).min(3),
  focusSkills: z.array(z.string()).min(2),
  openingMessage: z.string().min(20),
});

const turnSchema = z.object({
  reply: z.string().min(1),
  shouldEnd: z.boolean(),
  reason: z.string(),
});

const scoresSchema = z.object({
  overall: z.number(),
  content: z.number(),
  communication: z.number(),
  confidence: z.number(),
  grammar: z.number(),
  clarity: z.number(),
  relevance: z.number(),
});

const feedbackSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  grammarNotes: z.array(z.string()),
  confidenceNotes: z.array(z.string()),
  clarityNotes: z.array(z.string()),
  recommendation: z.enum(["strong_hire", "hire", "maybe", "no_hire"]),
  evidenceQuotes: z.array(z.string()),
});

function extractJson(content: string) {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() || trimmed;
  return JSON.parse(raw);
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeScores(scores: InterviewScores): InterviewScores {
  return {
    overall: clampScore(scores.overall),
    content: clampScore(scores.content),
    communication: clampScore(scores.communication),
    confidence: clampScore(scores.confidence),
    grammar: clampScore(scores.grammar),
    clarity: clampScore(scores.clarity),
    relevance: clampScore(scores.relevance),
  };
}

export async function generateInterviewPlan(
  input: CreateInterviewInput,
): Promise<InterviewPlan> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: getInterviewModel(),
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildPlanSystemPrompt() },
      { role: "user", content: buildPlanUserPrompt(input) },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to generate interview plan");

  return planSchema.parse(extractJson(content));
}

export async function generateNextTurn(
  session: InterviewSession,
  timing?: {
    elapsedMinutes: number;
    targetMinutes: number;
    forceWrapUp: boolean;
    answerCount: number;
  },
) {
  const openai = getOpenAI();
  const history = session.messages
    .filter((m) => m.role === "assistant" || m.role === "candidate")
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

  const elapsed = timing?.elapsedMinutes ?? 0;
  const target = timing?.targetMinutes ?? session.durationMinutes;
  const progressPct = target > 0 ? Math.round((elapsed / target) * 100) : 0;

  const timingNote = timing
    ? `Timing: ${elapsed.toFixed(1)} min elapsed of ${target} min target (${progressPct}%). Candidate answers so far: ${timing.answerCount}. Force wrap-up: ${timing.forceWrapUp ? "YES — close warmly now" : "no"}. ${
        timing.forceWrapUp || progressPct >= 85
          ? "You may set shouldEnd=true with a warm closing."
          : "Do NOT end yet — ask another question after a brief acknowledgment."
      }`
    : "Timing unavailable — prefer continuing unless the candidate wants to stop.";

  const response = await openai.chat.completions.create({
    model: getInterviewModel(),
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildTurnSystemPrompt(session) },
      ...history,
      {
        role: "user",
        content: `${timingNote}\n\nBased on the conversation so far, produce your next interviewer response as JSON.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to generate interviewer reply");

  return turnSchema.parse(extractJson(content));
}

export async function analyzeInterview(
  session: InterviewSession,
): Promise<InterviewReport> {
  const speechMetrics = computeSpeechMetrics(session.messages);
  const candidateAnswers = session.messages.filter((m) => m.role === "candidate");

  if (candidateAnswers.length === 0 || speechMetrics.totalWords < 8) {
    return buildInsufficientSignalReport(
      session,
      speechMetrics,
      candidateAnswers.length,
    );
  }

  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: getInterviewModel(),
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildAnalysisSystemPrompt() },
      { role: "user", content: buildAnalysisUserPrompt(session) },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to analyze interview");

  const parsed = extractJson(content) as {
    scores: InterviewScores;
    feedback: InterviewFeedback;
  };

  const scores = normalizeScores(scoresSchema.parse(parsed.scores));
  const feedback = sanitizeFeedback(
    feedbackSchema.parse(parsed.feedback),
    candidateAnswers.map((m) => m.content),
  );

  const fillerRatio =
    speechMetrics.totalWords === 0
      ? 0
      : speechMetrics.fillerWordCount / speechMetrics.totalWords;

  const isTrainingLevel =
    session.difficulty === "junior" ||
    /intern|fresh|junior|trainee|training|entry/i.test(
      `${session.title} ${session.jobDescription}`,
    );

  const quality = computeAnswerQuality(
    session.messages,
    candidateAnswers,
    speechMetrics,
  );

  // Small ASR/filler adjustments only — no soft score inflation.
  const adjustedConfidence = clampScore(
    scores.confidence -
      Math.min(4, fillerRatio * 12) -
      Math.min(3, speechMetrics.hedgingPhraseCount) +
      quality.confidenceNudge,
  );
  const adjustedClarity = clampScore(
    scores.clarity -
      Math.min(5, Math.max(0, fillerRatio - 0.05) * 16) +
      quality.clarityNudge,
  );
  const adjustedGrammar = clampScore(
    isTrainingLevel
      ? Math.max(scores.grammar + quality.grammarNudge, 48)
      : scores.grammar + quality.grammarNudge,
  );

  let blended = applyScoreCaps(
    normalizeScores({
      content: scores.content + quality.contentNudge,
      relevance: scores.relevance + quality.relevanceNudge,
      communication: scores.communication + quality.communicationNudge,
      confidence: adjustedConfidence,
      clarity: adjustedClarity,
      grammar: adjustedGrammar,
      overall: 0,
    }),
    quality,
  );

  blended.overall = clampScore(
    Math.min(
      quality.maxOverall,
      blended.content * 0.3 +
        blended.relevance * 0.25 +
        blended.communication * 0.18 +
        blended.confidence * 0.12 +
        blended.clarity * 0.1 +
        blended.grammar * 0.05,
    ),
  );

  feedback.recommendation = alignRecommendation(blended.overall, quality);

  if (candidateAnswers.length < 2) {
    blended = normalizeScores({
      overall: Math.min(blended.overall, 35),
      content: Math.min(blended.content, 30),
      communication: Math.min(blended.communication, 40),
      confidence: Math.min(blended.confidence, 35),
      grammar: Math.min(blended.grammar, 40),
      clarity: Math.min(blended.clarity, 40),
      relevance: Math.min(blended.relevance, 30),
    });
    feedback.recommendation =
      feedback.recommendation === "no_hire" ? "no_hire" : "maybe";
    if (
      !feedback.improvements.some((item) =>
        /incomplete|enough|signal/i.test(item),
      )
    ) {
      feedback.improvements = [
        "Complete a fuller interview with multiple substantive answers before scoring role fit.",
        ...feedback.improvements,
      ];
    }
  }

  return {
    scores: blended,
    feedback,
    speechMetrics,
    analyzedAt: new Date().toISOString(),
  };
}

type AnswerQuality = {
  contentNudge: number;
  relevanceNudge: number;
  communicationNudge: number;
  confidenceNudge: number;
  clarityNudge: number;
  grammarNudge: number;
  thin: boolean;
  vague: boolean;
  specific: boolean;
  depth: boolean;
  unfinished: boolean;
  maxOverall: number;
};

function applyScoreCaps(
  scores: InterviewScores,
  quality: AnswerQuality,
): InterviewScores {
  let { content, relevance, communication, confidence, clarity, grammar } =
    scores;

  // Cap inflated model scores for weak transcripts only — don't crush solid ones.
  if (quality.vague && !quality.specific) {
    content = Math.min(content, 72);
    relevance = Math.min(relevance, 74);
    communication = Math.min(communication, 72);
    confidence = Math.min(confidence, 78);
  }
  if (quality.thin || quality.unfinished) {
    content = Math.min(content, 70);
    relevance = Math.min(relevance, 72);
    communication = Math.min(communication, 68);
    clarity = Math.min(clarity, 68);
    confidence = Math.min(confidence, 74);
  }
  if (!quality.depth && !quality.specific && !quality.thin) {
    content = Math.min(content, 78);
    relevance = Math.min(relevance, 80);
  }

  return normalizeScores({
    content,
    relevance,
    communication,
    confidence,
    clarity,
    grammar,
    overall: 0,
  });
}

function isClosingMessage(text: string) {
  return /thank|goodbye|take care|hiring team|appreciate|best of luck|have a great/i.test(
    text,
  );
}

function computeAnswerQuality(
  messages: InterviewSession["messages"],
  answers: InterviewSession["messages"],
  speechMetrics: ReturnType<typeof computeSpeechMetrics>,
): AnswerQuality {
  const wordCounts = answers.map(
    (a) => a.content.trim().split(/\s+/).filter(Boolean).length,
  );
  const avgWords =
    wordCounts.length === 0
      ? 0
      : wordCounts.reduce((sum, n) => sum + n, 0) / wordCounts.length;
  const shortCount = wordCounts.filter((n) => n < 18).length;
  const shortRatio = answers.length === 0 ? 1 : shortCount / answers.length;

  const incompleteCount = answers.filter((a) => {
    const text = a.content.trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    return (
      words < 28 &&
      (/^(okay|ok|yeah|yes|well|so|i was|a time)\b/i.test(text) ||
        /,\s*$/.test(text) ||
        /\b(and|to|the|for|that|on)\s*$/i.test(text))
    );
  }).length;
  const incompleteRatio =
    answers.length === 0 ? 1 : incompleteCount / answers.length;

  const last = messages[messages.length - 1];
  // Closing thank-yous are NOT unfinished interviews.
  const unfinished = Boolean(
    last?.role === "assistant" &&
      /\?\s*$/.test(last.content.trim()) &&
      !isClosingMessage(last.content),
  );

  const joined = answers.map((a) => a.content.toLowerCase()).join(" ");

  const toolHits = [
    /\b(figma|miro|sketch|jira|notion|zeplin|invision)\b/i,
    /\b(my row|scatch|sigma|giraffe|boyfriend|boyfriending)\b/i,
  ].filter((re) => re.test(joined)).length;

  const methodHits = [
    /\b(wireframe|prototype|persona|usability|a\/?b test|research|accessibility|wcag|hipaa|hipack|contrast|responsive|component|library|checkout|design system|information architecture|stakeholder|handoff)\b/i,
    /\b(wca|bean points|pain points|user acceptance|evaluations|alt text|unmoderated|progressive disclosure)\b/i,
  ].filter((re) => re.test(joined)).length;

  const projectHits = [
    /\b(walmart|agency|health|hospital|audit|gap|light|furniture|cms|e-?commerce|marketing team)\b/i,
  ].filter((re) => re.test(joined)).length;

  const concreteAction =
    /\b(i (ran|interviewed|redesigned|simplified|presented|built|prototyped|validated|rewrote|mapped))\b/i.test(
      joined,
    );

  const depth =
    projectHits >= 1 &&
    methodHits >= 1 &&
    toolHits >= 1 &&
    avgWords >= 35 &&
    incompleteRatio < 0.2 &&
    !unfinished &&
    speechMetrics.totalWords >= 200;

  const specific =
    !unfinished &&
    incompleteRatio < 0.25 &&
    avgWords >= 32 &&
    speechMetrics.totalWords >= 180 &&
    ((toolHits >= 1 && methodHits >= 1) ||
      (projectHits >= 1 && methodHits >= 1) ||
      (concreteAction &&
        (toolHits >= 1 || methodHits >= 1 || projectHits >= 1)));

  const thin =
    avgWords < 30 ||
    shortRatio >= 0.4 ||
    incompleteRatio >= 0.3 ||
    speechMetrics.totalWords < 180 ||
    unfinished;

  const vague =
    !depth &&
    !specific &&
    (toolHits >= 1 || methodHits >= 1 || speechMetrics.totalWords >= 220) &&
    (incompleteRatio >= 0.15 || avgWords < 55 || methodHits + projectHits < 2);

  let contentNudge = 0;
  let relevanceNudge = 0;
  let communicationNudge = 0;
  let confidenceNudge = 0;
  let clarityNudge = 0;
  const grammarNudge = 0;

  if (thin) {
    contentNudge -= 6;
    relevanceNudge -= 5;
    communicationNudge -= 5;
    clarityNudge -= 4;
  }
  if (incompleteRatio >= 0.25) {
    contentNudge -= 4;
    clarityNudge -= 5;
    communicationNudge -= 4;
  }
  if (unfinished) {
    contentNudge -= 4;
    relevanceNudge -= 3;
    confidenceNudge -= 3;
  }
  if (vague) {
    contentNudge -= 5;
    clarityNudge -= 3;
    communicationNudge -= 3;
    relevanceNudge -= 3;
  }
  if (specific) {
    contentNudge += 3;
    relevanceNudge += 3;
    communicationNudge += 2;
  }
  if (depth) {
    contentNudge += 3;
    relevanceNudge += 3;
    confidenceNudge += 2;
  }

  const clampNudge = (n: number) => Math.max(-10, Math.min(6, n));

  let maxOverall = 88;
  if (depth) maxOverall = 88;
  else if (specific) maxOverall = 78;
  else maxOverall = 72;
  if (vague) maxOverall = Math.min(maxOverall, 68);
  if (thin) maxOverall = Math.min(maxOverall, 64);
  if (unfinished && thin) maxOverall = Math.min(maxOverall, 62);
  else if (unfinished) maxOverall = Math.min(maxOverall, 68);
  if (incompleteRatio >= 0.3) maxOverall = Math.min(maxOverall, 66);

  return {
    contentNudge: clampNudge(contentNudge),
    relevanceNudge: clampNudge(relevanceNudge),
    communicationNudge: clampNudge(communicationNudge),
    confidenceNudge: clampNudge(confidenceNudge),
    clarityNudge: clampNudge(clarityNudge),
    grammarNudge: clampNudge(grammarNudge),
    thin,
    vague,
    specific,
    depth,
    unfinished,
    maxOverall,
  };
}

function alignRecommendation(
  overall: number,
  quality: AnswerQuality,
): InterviewFeedback["recommendation"] {
  if (overall >= 85 && quality.depth) return "strong_hire";
  if (
    overall >= 70 &&
    (quality.specific || quality.depth) &&
    !quality.thin &&
    !quality.unfinished
  ) {
    return "hire";
  }
  if (overall >= 73 && !quality.thin && !quality.unfinished && !quality.vague) {
    return "hire";
  }
  if (overall >= 58) return "maybe";
  return "no_hire";
}

function buildInsufficientSignalReport(
  session: InterviewSession,
  speechMetrics: ReturnType<typeof computeSpeechMetrics>,
  answerCount: number,
): InterviewReport {
  const reason =
    answerCount === 0
      ? `${session.candidateName} ended the interview without providing any answers. There is not enough signal to assess role fit.`
      : `${session.candidateName} provided almost no spoken or typed content before the interview ended. There is not enough signal to assess role fit.`;

  return {
    scores: {
      overall: 0,
      content: 0,
      communication: 0,
      confidence: 0,
      grammar: 0,
      clarity: 0,
      relevance: 0,
    },
    feedback: {
      summary: reason,
      strengths: [],
      improvements: [
        "Retake the interview and answer the interviewer’s questions fully.",
        "Provide concrete examples tied to the job description.",
      ],
      grammarNotes: ["Not enough candidate speech to evaluate grammar."],
      confidenceNotes: ["Not enough candidate speech to evaluate confidence."],
      clarityNotes: ["Not enough candidate speech to evaluate clarity."],
      recommendation: "no_hire",
      evidenceQuotes: [],
    },
    speechMetrics,
    analyzedAt: new Date().toISOString(),
  };
}

function sanitizeFeedback(
  feedback: InterviewFeedback,
  candidateTexts: string[],
): InterviewFeedback {
  const haystack = candidateTexts.join(" ").toLowerCase();
  const evidenceQuotes = feedback.evidenceQuotes.filter((quote) => {
    const needle = quote.trim().toLowerCase();
    return needle.length > 0 && haystack.includes(needle);
  });

  return {
    ...feedback,
    evidenceQuotes,
    strengths:
      evidenceQuotes.length === 0 && candidateTexts.length < 2
        ? []
        : feedback.strengths,
  };
}
