import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { ApiError, fail, ok, parseJson } from "@/lib/api/response";
import { turnSchema } from "@/lib/api/validators";
import { enrichCandidateMeta } from "@/lib/analysis/speech-metrics";
import { interviewsRepository } from "@/lib/db/interviews.repository";
import { isAdminConfigured } from "@/lib/firebase/admin";
import {
  analyzeInterview,
  generateNextTurn,
} from "@/lib/openai/interview-engine";
import { synthesizeSpeech } from "@/lib/openai/tts";
import { MAX_MESSAGES } from "@/lib/utils/constants";
import type { InterviewMessage, InterviewSession } from "@/types/interview";

function now() {
  return new Date().toISOString();
}

function withMessages(
  session: InterviewSession,
  messages: InterviewMessage[],
): InterviewSession {
  return {
    ...session,
    messages: [...session.messages, ...messages],
    status: "in_progress",
    startedAt: session.startedAt ?? now(),
    updatedAt: now(),
  };
}

function asSession(value: unknown): InterviewSession | null {
  if (!value || typeof value !== "object") return null;
  const session = value as InterviewSession;
  if (!session.id || !session.token || !Array.isArray(session.messages)) {
    return null;
  }
  return session;
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request);
    const input = turnSchema.parse(body);
    const useAdmin = isAdminConfigured();

    let session: InterviewSession | null = null;
    if (useAdmin) {
      session = await interviewsRepository.getByToken(input.token);
    } else {
      session = asSession(input.session);
      if (!session || session.token !== input.token) {
        throw new ApiError(
          400,
          "Interview session is required",
          "SESSION_REQUIRED",
        );
      }
    }

    if (!session) throw new ApiError(404, "Interview not found", "NOT_FOUND");
    if (session.status === "completed") {
      throw new ApiError(400, "Interview already completed", "COMPLETED");
    }
    if (!session.consentAccepted) {
      throw new ApiError(400, "Consent required before answering", "NO_CONSENT");
    }

    const candidateMessage: InterviewMessage = {
      id: nanoid(10),
      role: "candidate",
      content: input.transcript,
      createdAt: now(),
      meta: enrichCandidateMeta(input.transcript, input.durationMs || 0),
    };

    let working = useAdmin
      ? await interviewsRepository.appendMessages(session.id, [candidateMessage])
      : withMessages(session, [candidateMessage]);

    const shouldForceEnd =
      working.messages.filter((m) => m.role === "candidate").length >= 8 ||
      working.messages.length >= MAX_MESSAGES;

    const turn = await generateNextTurn(working);

    const assistantMessage: InterviewMessage = {
      id: nanoid(10),
      role: "assistant",
      content: turn.reply,
      createdAt: now(),
    };

    working = useAdmin
      ? await interviewsRepository.appendMessages(working.id, [assistantMessage])
      : withMessages(working, [assistantMessage]);

    let audioBase64: string | undefined;
    try {
      const audio = await synthesizeSpeech(turn.reply);
      audioBase64 = audio.toString("base64");
    } catch (ttsError) {
      console.warn("TTS failed", ttsError);
    }

    if (turn.shouldEnd || shouldForceEnd) {
      const report = await analyzeInterview(working);
      if (useAdmin) {
        working = await interviewsRepository.complete(working.id, report);
      } else {
        working = {
          ...working,
          report,
          status: "completed",
          completedAt: now(),
          updatedAt: now(),
        };
      }
    }

    return ok({
      session: working,
      reply: turn.reply,
      shouldEnd: turn.shouldEnd || shouldForceEnd,
      audioBase64,
      persisted: useAdmin,
    });
  } catch (error) {
    return fail(error);
  }
}
