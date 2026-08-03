import { NextRequest } from "next/server";
import { ApiError, fail, ok } from "@/lib/api/response";
import {
  requireOwnedInterview,
  unauthorizedResponse,
} from "@/lib/auth/guards";
import { sendInterviewInvite } from "@/lib/email/send";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { session } = await requireOwnedInterview(request, id);

    if (!session.candidateEmail) {
      throw new ApiError(
        400,
        "This interview has no candidate email",
        "NO_EMAIL",
      );
    }

    const result = await sendInterviewInvite({
      to: session.candidateEmail,
      candidateName: session.candidateName,
      title: session.title,
      token: session.token,
      durationMinutes: session.durationMinutes,
    });

    if (!result.sent) {
      if ("skipped" in result && result.skipped) {
        throw new ApiError(503, result.reason, "EMAIL_NOT_CONFIGURED");
      }
      throw new ApiError(
        502,
        "error" in result ? result.error : "Failed to send invite",
        "EMAIL_SEND_FAILED",
      );
    }

    return ok({ sent: true, to: session.candidateEmail });
  } catch (error) {
    return fail(unauthorizedResponse(error));
  }
}
