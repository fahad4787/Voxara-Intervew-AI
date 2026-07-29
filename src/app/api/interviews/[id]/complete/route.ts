import { NextRequest } from "next/server";
import { ApiError, fail, ok, parseJson } from "@/lib/api/response";
import { completeSchema } from "@/lib/api/validators";
import { interviewsRepository } from "@/lib/db/interviews.repository";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { analyzeInterview } from "@/lib/openai/interview-engine";
import type { InterviewSession } from "@/types/interview";

type Params = { params: Promise<{ id: string }> };

function asSession(value: unknown): InterviewSession | null {
  if (!value || typeof value !== "object") return null;
  const session = value as InterviewSession;
  if (!session.id || !session.token || !Array.isArray(session.messages)) {
    return null;
  }
  return session;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await parseJson(request);
    const { token, session: clientSession } = completeSchema.parse(body);
    const useAdmin = isAdminConfigured();

    let session: InterviewSession | null = null;
    const client = asSession(clientSession);

    if (useAdmin) {
      session = await interviewsRepository.getById(id);
      if (session && client) {
        session = {
          ...session,
          recordingUrl: client.recordingUrl ?? session.recordingUrl,
          recordingPath: client.recordingPath ?? session.recordingPath,
          messages:
            client.messages?.length > session.messages.length
              ? client.messages
              : session.messages,
        };
      }
    } else {
      session = client;
    }

    if (!session || session.id !== id || session.token !== token) {
      throw new ApiError(404, "Interview not found", "NOT_FOUND");
    }

    if (session.status === "completed" && session.report) {
      return ok({ ...session, persisted: true as const });
    }

    const report = await analyzeInterview(session);
    if (useAdmin) {
      const completed = await interviewsRepository.complete(session.id, report, {
        recordingUrl: session.recordingUrl,
        recordingPath: session.recordingPath,
      });
      return ok({ ...completed, persisted: true as const });
    }

    const completed: InterviewSession = {
      ...session,
      report,
      status: "completed",
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return ok({ ...completed, persisted: false as const });
  } catch (error) {
    return fail(error);
  }
}
