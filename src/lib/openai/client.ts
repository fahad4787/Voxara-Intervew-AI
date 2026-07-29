import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it to your .env.local file.",
    );
  }

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  return client;
}

export function getInterviewModel() {
  return process.env.OPENAI_INTERVIEW_MODEL || "gpt-4o-mini";
}

export function getTtsModel() {
  return process.env.OPENAI_TTS_MODEL || "tts-1";
}

export function getTtsVoice() {
  return process.env.OPENAI_TTS_VOICE || "coral";
}
