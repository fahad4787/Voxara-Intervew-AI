import {
  getOpenAI,
  getTtsModel,
  getTtsVoice,
} from "@/lib/openai/client";

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const openai = getOpenAI();
  const response = await openai.audio.speech.create({
    model: getTtsModel(),
    voice: getTtsVoice() as "nova",
    input: text.slice(0, 2000),
    response_format: "mp3",
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
