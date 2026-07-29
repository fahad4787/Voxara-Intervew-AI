import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/response";
import { getOpenAI } from "@/lib/openai/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("audio");
    if (!(file instanceof File)) {
      return fail(new Error("Audio file is required"));
    }

    // Tiny clips are usually silence / noise — skip Whisper.
    if (file.size < 1200) {
      return ok({ text: "", skipped: true });
    }

    const openai = getOpenAI();
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1",
      language: "en",
      prompt:
        "Interview about UI/UX design. Common terms: Figma, Miro, Sketch, Jira, wireframe, prototype, persona, usability, accessibility, WCAG, stakeholder, research, A/B testing.",
    });

    return ok({
      text: (transcription.text || "").trim(),
      skipped: false,
    });
  } catch (error) {
    return fail(error);
  }
}
