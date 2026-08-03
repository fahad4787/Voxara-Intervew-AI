import { NextRequest } from "next/server";
import { ApiError, fail, ok } from "@/lib/api/response";
import { requireInterviewToken } from "@/lib/auth/guards";
import { getOpenAI } from "@/lib/openai/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const token = form.get("token");
    if (typeof token !== "string" || token.trim().length < 8) {
      throw new ApiError(401, "Valid interview token required", "UNAUTHORIZED");
    }

    await requireInterviewToken(token);

    const file = form.get("audio");
    if (!(file instanceof File)) {
      throw new ApiError(400, "Audio file is required", "VALIDATION_ERROR");
    }

    if (file.size < 1200) {
      return ok({ text: "", skipped: true });
    }

    const openai = getOpenAI();
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1",
      language: "en",
      prompt:
        "Professional job interview conversation. Prefer clear wording; ignore filler noise.",
    });

    return ok({
      text: (transcription.text || "").trim(),
      skipped: false,
    });
  } catch (error) {
    return fail(error);
  }
}
