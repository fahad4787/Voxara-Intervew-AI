import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok, parseJson } from "@/lib/api/response";
import { synthesizeSpeech } from "@/lib/openai/tts";

const schema = z.object({
  text: z.string().trim().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request);
    const { text } = schema.parse(body);
    const audio = await synthesizeSpeech(text);
    return ok({ audioBase64: audio.toString("base64") });
  } catch (error) {
    return fail(error);
  }
}
