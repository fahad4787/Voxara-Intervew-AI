import { NextRequest } from "next/server";
import { ApiError, fail, ok, parseJson } from "@/lib/api/response";
import { createInterviewSchema } from "@/lib/api/validators";
import { requireRequestUser } from "@/lib/auth/session";
import {
  buildInterviewSession,
  interviewsRepository,
} from "@/lib/db/interviews.repository";
import { sendInterviewInvite } from "@/lib/email/send";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { generateInterviewPlan } from "@/lib/openai/interview-engine";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    if (!isAdminConfigured()) {
      return ok([]);
    }
    const interviews = await interviewsRepository.list(user.uid);
    return ok(interviews);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(new ApiError(401, "Sign in required", "UNAUTHORIZED"));
    }
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const body = await parseJson(request);
    const input = createInterviewSchema.parse(body);
    const plan = await generateInterviewPlan(input);
    const session = buildInterviewSession(
      { ...input, ownerId: user.uid },
      plan,
    );

    let persisted = false;
    if (isAdminConfigured()) {
      const { interviewStore } = await import("@/lib/db/store");
      await interviewStore.create(session);
      persisted = true;
    }

    let inviteEmail:
      | { sent: true }
      | { sent: false; skipped?: boolean; message: string }
      | undefined;

    if (session.candidateEmail) {
      const result = await sendInterviewInvite({
        to: session.candidateEmail,
        candidateName: session.candidateName,
        title: session.title,
        token: session.token,
        durationMinutes: session.durationMinutes,
      });

      if (result.sent) {
        inviteEmail = { sent: true };
      } else if ("skipped" in result && result.skipped) {
        inviteEmail = {
          sent: false,
          skipped: true,
          message: result.reason,
        };
      } else {
        inviteEmail = {
          sent: false,
          message: "error" in result ? result.error : "Failed to send invite",
        };
      }
    }

    return ok(
      { ...session, persisted, inviteEmail },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(new ApiError(401, "Sign in required", "UNAUTHORIZED"));
    }
    return fail(error);
  }
}
