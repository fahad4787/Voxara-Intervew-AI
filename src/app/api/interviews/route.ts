import { NextRequest } from "next/server";
import { fail, ok, parseJson } from "@/lib/api/response";
import { createInterviewSchema } from "@/lib/api/validators";
import {
  requireAdminConfigured,
  unauthorizedResponse,
} from "@/lib/auth/guards";
import { requireRequestUser } from "@/lib/auth/session";
import { interviewsRepository } from "@/lib/db/interviews.repository";
import { sendInterviewInvite } from "@/lib/email/send";
import { generateInterviewPlan } from "@/lib/openai/interview-engine";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    requireAdminConfigured();
    const interviews = await interviewsRepository.list(user.uid);
    return ok(interviews);
  } catch (error) {
    return fail(unauthorizedResponse(error));
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    requireAdminConfigured();

    const body = await parseJson(request);
    const input = createInterviewSchema.parse(body);
    const plan = await generateInterviewPlan(input);
    const session = await interviewsRepository.create(
      { ...input, ownerId: user.uid },
      plan,
    );

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
      { ...session, persisted: true as const, inviteEmail },
      { status: 201 },
    );
  } catch (error) {
    return fail(unauthorizedResponse(error));
  }
}
