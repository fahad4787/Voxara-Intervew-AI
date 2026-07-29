import {
  getOpenAI,
  getTtsModel,
  getTtsVoice,
} from "@/lib/openai/client";

const VOICES = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar",
]);

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const openai = getOpenAI();
  const model = getTtsModel();
  const voice = getTtsVoice();
  const resolvedVoice = VOICES.has(voice) ? voice : "coral";

  const response = await openai.audio.speech.create({
    model,
    voice: resolvedVoice as "coral",
    input: text.slice(0, 2000),
    response_format: "mp3",
    ...(model === "gpt-4o-mini-tts"
      ? {
          instructions:
            "Speak as a warm, professional female interviewer. Natural pace, clear, friendly, not robotic.",
        }
      : {}),
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
