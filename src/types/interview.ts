export type InterviewStatus =
  | "draft"
  | "ready"
  | "in_progress"
  | "completed"
  | "cancelled";

export type InterviewDifficulty = "junior" | "mid" | "senior";

export type MessageRole = "assistant" | "candidate" | "system";

export interface InterviewMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  meta?: {
    durationMs?: number;
    fillerWordCount?: number;
    wordsPerMinute?: number;
  };
}

export interface InterviewPlan {
  topics: string[];
  questions: string[];
  focusSkills: string[];
  openingMessage: string;
}

export interface InterviewScores {
  overall: number;
  content: number;
  communication: number;
  confidence: number;
  grammar: number;
  clarity: number;
  relevance: number;
}

export interface InterviewFeedback {
  summary: string;
  strengths: string[];
  improvements: string[];
  grammarNotes: string[];
  confidenceNotes: string[];
  clarityNotes: string[];
  recommendation: "strong_hire" | "hire" | "maybe" | "no_hire";
  evidenceQuotes: string[];
}

export interface InterviewReport {
  scores: InterviewScores;
  feedback: InterviewFeedback;
  speechMetrics: SpeechMetrics;
  analyzedAt: string;
}

export interface SpeechMetrics {
  totalWords: number;
  fillerWordCount: number;
  fillerWords: Record<string, number>;
  averageWordsPerMinute: number;
  averageAnswerDurationMs: number;
  pauseIndicators: number;
  hedgingPhraseCount: number;
}

export interface InterviewSession {
  id: string;
  token: string;
  ownerId?: string;
  title: string;
  jobDescription: string;
  candidateName: string;
  candidateEmail?: string;
  difficulty: InterviewDifficulty;
  durationMinutes: number;
  status: InterviewStatus;
  plan: InterviewPlan | null;
  messages: InterviewMessage[];
  report: InterviewReport | null;
  consentAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CreateInterviewInput {
  title: string;
  jobDescription: string;
  candidateName: string;
  candidateEmail?: string;
  difficulty: InterviewDifficulty;
  durationMinutes: number;
  ownerId?: string;
}
