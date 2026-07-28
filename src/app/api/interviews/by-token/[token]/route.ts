import { NextRequest } from "next/server";
import { ApiError, fail, ok, parseJson } from "@/lib/api/response";
import { consentSchema } from "@/lib/api/validators";
import { interviewsRepository } from "@/lib/db/interviews.repository";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const session = await interviewsRepository.getByToken(token);
    if (!session) throw new ApiError(404, "Interview not found", "NOT_FOUND");

    // Candidate-facing payload: hide internal plan details if desired later
    return ok(session);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const body = await parseJson(request);
    consentSchema.parse(body);

    const session = await interviewsRepository.acceptConsent(token);
    if (!session) throw new ApiError(404, "Interview not found", "NOT_FOUND");
    return ok(session);
  } catch (error) {
    return fail(error);
  }
}
