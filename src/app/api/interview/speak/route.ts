import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok, parseJson } from "@/lib/api/response";
import { requireInterviewToken } from "@/lib/auth/guards";
import { synthesizeSpeech } from "@/lib/openai/tts";

const schema = z.object({
  text: z.string().trim().min(1).max(2000),
  token: z.string().trim().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request);
    const { text, token } = schema.parse(body);
    await requireInterviewToken(token);
    const audio = await synthesizeSpeech(text);
    return ok({ audioBase64: audio.toString("base64") });
  } catch (error) {
    return fail(error);
  }
}
