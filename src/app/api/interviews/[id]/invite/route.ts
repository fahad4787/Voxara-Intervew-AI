import { NextRequest } from "next/server";
import { ApiError, fail, ok } from "@/lib/api/response";
import { requireRequestUser } from "@/lib/auth/session";
import { sendInterviewInvite } from "@/lib/email/send";
import { isAdminConfigured } from "@/lib/firebase/admin";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireRequestUser(request);
    const { id } = await params;

    if (!isAdminConfigured()) {
      throw new ApiError(
        503,
        "Firebase Admin is not configured",
        "ADMIN_NOT_CONFIGURED",
      );
    }

    const { interviewStore } = await import("@/lib/db/store");
    const session = await interviewStore.getById(id);
    if (!session || session.ownerId !== user.uid) {
      throw new ApiError(404, "Interview not found", "NOT_FOUND");
    }

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
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(new ApiError(401, "Sign in required", "UNAUTHORIZED"));
    }
    return fail(error);
  }
}
