import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { ApiError, fail, ok, parseJson } from "@/lib/api/response";
import { turnSchema } from "@/lib/api/validators";
import { requireAdminConfigured } from "@/lib/auth/guards";
import { enrichCandidateMeta } from "@/lib/analysis/speech-metrics";
import { interviewsRepository } from "@/lib/db/interviews.repository";
import { generateNextTurn } from "@/lib/openai/interview-engine";
import { buildClosingMessage } from "@/lib/interview/closing";
import { synthesizeSpeech } from "@/lib/openai/tts";
import {
  MAX_MESSAGES,
  maxAnswersForDuration,
} from "@/lib/utils/constants";
import type { InterviewMessage, InterviewSession } from "@/types/interview";

function now() {
  return new Date().toISOString();
}

function getTiming(session: InterviewSession) {
  const targetMinutes = session.durationMinutes;
  const startedAt = session.startedAt
    ? new Date(session.startedAt).getTime()
    : Date.now();
  const elapsedMinutes = Math.max(0, (Date.now() - startedAt) / 60000);
  const answerCount = session.messages.filter(
    (m) => m.role === "candidate",
  ).length;
  const maxAnswers = maxAnswersForDuration(targetMinutes);
  const graceMinutes = targetMinutes * 0.15;
  const timeUp = elapsedMinutes >= targetMinutes + graceMinutes;
  const nearEnd = elapsedMinutes >= targetMinutes * 0.85;
  const answersCap = answerCount >= maxAnswers && nearEnd;
  const forceWrapUp =
    timeUp || answersCap || session.messages.length >= MAX_MESSAGES;

  return {
    elapsedMinutes,
    targetMinutes,
    answerCount,
    forceWrapUp,
    nearEnd,
  };
}

export async function POST(request: NextRequest) {
  try {
    requireAdminConfigured();

    const body = await parseJson(request);
    const input = turnSchema.parse(body);
    const session = await interviewsRepository.getByToken(input.token);

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

    let working = await interviewsRepository.appendMessages(session.id, [
      candidateMessage,
    ]);

    const timing = getTiming(working);
    const turn = await generateNextTurn(working, timing);

    const allowEnd = timing.forceWrapUp || timing.nearEnd;
    const shouldEnd = allowEnd && (turn.shouldEnd || timing.forceWrapUp);

    let reply = turn.reply;
    const looksLikeQuestion = /\?\s*$/.test(turn.reply.trim());
    const looksLikeClosing =
      /thank|goodbye|take care|hiring team|appreciate/i.test(turn.reply);
    if (shouldEnd && (looksLikeQuestion || !looksLikeClosing)) {
      reply = buildClosingMessage(working);
    }

    const assistantMessage: InterviewMessage = {
      id: nanoid(10),
      role: "assistant",
      content: reply,
      createdAt: now(),
    };

    working = await interviewsRepository.appendMessages(working.id, [
      assistantMessage,
    ]);

    let audioBase64: string | undefined;
    try {
      const audio = await synthesizeSpeech(reply);
      audioBase64 = audio.toString("base64");
    } catch (ttsError) {
      console.warn("TTS failed", ttsError);
    }

    return ok({
      session: working,
      reply,
      shouldEnd,
      audioBase64,
      persisted: true as const,
    });
  } catch (error) {
    return fail(error);
  }
}
