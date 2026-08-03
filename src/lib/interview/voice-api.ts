export async function fetchSpeechBase64(
  text: string,
  token: string,
): Promise<string | null> {
  try {
    const response = await fetch("/api/interview/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, token }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      success: boolean;
      data?: { audioBase64: string };
    };
    return payload.success && payload.data?.audioBase64
      ? payload.data.audioBase64
      : null;
  } catch {
    return null;
  }
}

export async function transcribeWithWhisper(
  blob: Blob,
  token: string,
): Promise<string | null> {
  try {
    const form = new FormData();
    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    form.append("audio", blob, `answer.${ext}`);
    form.append("token", token);
    const response = await fetch("/api/interview/transcribe", {
      method: "POST",
      body: form,
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      success: boolean;
      data?: { text?: string };
    };
    const text = payload.data?.text?.trim();
    return text || null;
  } catch {
    return null;
  }
}

export function transcriptLooksSolid(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return text.trim().length >= 36 || words.length >= 7;
}
