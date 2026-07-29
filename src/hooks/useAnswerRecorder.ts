"use client";

import { useCallback, useRef } from "react";

function pickMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];
  for (const type of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }
  return "";
}

/** Records mic audio while the candidate speaks for Whisper transcription. */
export function useAnswerRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef("");

  const start = useCallback((stream: MediaStream | null) => {
    chunksRef.current = [];
    recorderRef.current?.stop();
    recorderRef.current = null;

    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    try {
      const mimeType = pickMimeType();
      mimeRef.current = mimeType;
      const audioStream = new MediaStream(audioTracks);
      const recorder = mimeType
        ? new MediaRecorder(audioStream, { mimeType })
        : new MediaRecorder(audioStream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorderRef.current = recorder;
      recorder.start(250);
    } catch (error) {
      console.warn("Could not start answer recorder", error);
      recorderRef.current = null;
    }
  }, []);

  const stop = useCallback(async (): Promise<Blob | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      recorderRef.current = null;
      return null;
    }

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const type = mimeRef.current || "audio/webm";
        const blob =
          chunksRef.current.length > 0
            ? new Blob(chunksRef.current, { type })
            : null;
        chunksRef.current = [];
        recorderRef.current = null;
        resolve(blob);
      };
      try {
        recorder.stop();
      } catch {
        recorderRef.current = null;
        resolve(null);
      }
    });
  }, []);

  return { start, stop };
}
