import { NextRequest } from "next/server";
import { ApiError, fail, ok } from "@/lib/api/response";
import {
  requireOwnedInterview,
  unauthorizedResponse,
} from "@/lib/auth/guards";
import { interviewsRepository } from "@/lib/db/interviews.repository";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { session } = await requireOwnedInterview(request, id);
    return ok(session);
  } catch (error) {
    return fail(unauthorizedResponse(error));
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await requireOwnedInterview(request, id);
    const removed = await interviewsRepository.remove(id);
    if (!removed) throw new ApiError(404, "Interview not found", "NOT_FOUND");
    return ok({ id });
  } catch (error) {
    return fail(unauthorizedResponse(error));
  }
}
