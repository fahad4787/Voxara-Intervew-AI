import { nanoid } from "nanoid";
import { interviewStore } from "@/lib/db/store";
import type {
  CreateInterviewInput,
  InterviewMessage,
  InterviewPlan,
  InterviewReport,
  InterviewSession,
} from "@/types/interview";

function now() {
  return new Date().toISOString();
}

export function buildInterviewSession(
  input: CreateInterviewInput,
  plan: InterviewPlan,
): InterviewSession {
  const timestamp = now();
  return {
    id: nanoid(12),
    token: nanoid(24),
    ownerId: input.ownerId,
    title: input.title,
    jobDescription: input.jobDescription,
    candidateName: input.candidateName,
    candidateEmail: input.candidateEmail,
    difficulty: input.difficulty,
    durationMinutes: input.durationMinutes,
    status: "ready",
    plan,
    messages: [
      {
        id: nanoid(10),
        role: "assistant",
        content: plan.openingMessage,
        createdAt: timestamp,
      },
    ],
    report: null,
    consentAccepted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const interviewsRepository = {
  list: (ownerId?: string) => interviewStore.list(ownerId),

  getById: (id: string) => interviewStore.getById(id),

  getByToken: (token: string) => interviewStore.getByToken(token),

  async create(
    input: CreateInterviewInput,
    plan: InterviewPlan,
  ): Promise<InterviewSession> {
    const session = buildInterviewSession(input, plan);
    return interviewStore.create(session);
  },

  async acceptConsent(token: string) {
    const session = await interviewStore.getByToken(token);
    if (!session) return null;

    return interviewStore.update(session.id, (current) => ({
      ...current,
      consentAccepted: true,
      status: current.status === "ready" ? "in_progress" : current.status,
      startedAt: current.startedAt ?? now(),
      updatedAt: now(),
    }));
  },

  async appendMessages(id: string, messages: InterviewMessage[]) {
    return interviewStore.update(id, (current) => ({
      ...current,
      messages: [...current.messages, ...messages],
      status: "in_progress",
      startedAt: current.startedAt ?? now(),
      updatedAt: now(),
    }));
  },

  async complete(
    id: string,
    report: InterviewReport,
    extras?: Pick<InterviewSession, "recordingUrl" | "recordingPath">,
  ) {
    return interviewStore.update(id, (current) => ({
      ...current,
      report,
      status: "completed",
      completedAt: now(),
      updatedAt: now(),
      recordingUrl: extras?.recordingUrl ?? current.recordingUrl,
      recordingPath: extras?.recordingPath ?? current.recordingPath,
    }));
  },

  remove: (id: string) => interviewStore.remove(id),
};
