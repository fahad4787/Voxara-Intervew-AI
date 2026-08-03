import { ApiError } from "@/lib/api/response";
import { requireRequestUser } from "@/lib/auth/session";
import { interviewsRepository } from "@/lib/db/interviews.repository";
import { isAdminConfigured } from "@/lib/firebase/admin";
import type { InterviewSession } from "@/types/interview";

export function requireAdminConfigured() {
  if (!isAdminConfigured()) {
    throw new ApiError(
      503,
      "Firebase Admin is not configured. Set FIREBASE_SA_B64 (or FIREBASE_SERVICE_ACCOUNT_KEY).",
      "ADMIN_NOT_CONFIGURED",
    );
  }
}

export async function requireOwnedInterview(
  request: Request,
  id: string,
): Promise<{ user: Awaited<ReturnType<typeof requireRequestUser>>; session: InterviewSession }> {
  const user = await requireRequestUser(request);
  requireAdminConfigured();

  const session = await interviewsRepository.getById(id);
  if (!session || session.ownerId !== user.uid) {
    throw new ApiError(404, "Interview not found", "NOT_FOUND");
  }

  return { user, session };
}

export async function requireInterviewToken(
  token: string,
): Promise<InterviewSession> {
  requireAdminConfigured();

  const trimmed = token.trim();
  if (trimmed.length < 8) {
    throw new ApiError(401, "Valid interview token required", "UNAUTHORIZED");
  }

  const session = await interviewsRepository.getByToken(trimmed);
  if (!session) {
    throw new ApiError(401, "Invalid interview token", "UNAUTHORIZED");
  }

  return session;
}

export function unauthorizedResponse(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return new ApiError(401, "Sign in required", "UNAUTHORIZED");
  }
  return error;
}
