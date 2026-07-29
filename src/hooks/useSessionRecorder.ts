"use client";

import { useCallback, useRef, useState } from "react";

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

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function useSessionRecorder() {
  const ctxRef = useRef<AudioContext | null>(null);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef("");
  const ttsSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);

  const ensureContext = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctxRef.current = new Ctx();
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    if (!destRef.current) {
      destRef.current = ctxRef.current.createMediaStreamDestination();
    }
    return ctxRef.current;
  }, []);

  const start = useCallback(
    async (micStream: MediaStream | null) => {
      if (!micStream || recorderRef.current) return false;

      try {
        const ctx = await ensureContext();
        const dest = destRef.current!;
        const audioTracks = micStream.getAudioTracks();
        if (audioTracks.length === 0) return false;

        micSourceRef.current?.disconnect();
        const micSource = ctx.createMediaStreamSource(
          new MediaStream(audioTracks),
        );
        micSource.connect(dest);
        micSourceRef.current = micSource;

        chunksRef.current = [];
        const mimeType = pickMimeType();
        mimeRef.current = mimeType;
        const recorder = mimeType
          ? new MediaRecorder(dest.stream, { mimeType })
          : new MediaRecorder(dest.stream);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        recorderRef.current = recorder;
        recorder.start(1000);
        setRecording(true);
        return true;
      } catch (error) {
        console.warn("Could not start session recorder", error);
        recorderRef.current = null;
        setRecording(false);
        return false;
      }
    },
    [ensureContext],
  );

  const stopPlayback = useCallback(() => {
    try {
      ttsSourceRef.current?.stop();
    } catch {
      // already stopped
    }
    ttsSourceRef.current = null;
    setSpeaking(false);
  }, []);

  const playBase64Mp3 = useCallback(
    async (base64: string, options?: { soft?: boolean }) => {
      const soft = Boolean(options?.soft);
      if (!soft) stopPlayback();

      const ctx = await ensureContext();
      const dest = destRef.current;

      try {
        const buffer = await ctx.decodeAudioData(
          base64ToArrayBuffer(base64).slice(0),
        );
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        if (dest) source.connect(dest);
        ttsSourceRef.current = source;
        if (!soft) setSpeaking(true);

        await new Promise<void>((resolve, reject) => {
          source.onended = () => {
            if (ttsSourceRef.current === source) {
              ttsSourceRef.current = null;
              if (!soft) setSpeaking(false);
            }
            resolve();
          };
          try {
            source.start(0);
          } catch (error) {
            if (!soft) setSpeaking(false);
            reject(error);
          }
        });
      } catch {
        if (!soft) setSpeaking(false);
        const url = `data:audio/mpeg;base64,${base64}`;
        const audio = new Audio(url);
        if (!soft) setSpeaking(true);
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            if (!soft) setSpeaking(false);
            resolve();
          };
          audio.onerror = () => {
            if (!soft) setSpeaking(false);
            reject(new Error("Failed to play audio"));
          };
          void audio.play().catch(reject);
        });
      }
    },
    [ensureContext, stopPlayback],
  );

  const stop = useCallback(async (): Promise<Blob | null> => {
    stopPlayback();

    const recorder = recorderRef.current;
    micSourceRef.current?.disconnect();
    micSourceRef.current = null;

    if (!recorder || recorder.state === "inactive") {
      recorderRef.current = null;
      setRecording(false);
      return null;
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const type = mimeRef.current || "audio/webm";
        const next =
          chunksRef.current.length > 0
            ? new Blob(chunksRef.current, { type })
            : null;
        chunksRef.current = [];
        recorderRef.current = null;
        resolve(next);
      };
      try {
        recorder.stop();
      } catch {
        recorderRef.current = null;
        resolve(null);
      }
    });

    setRecording(false);

    if (ctxRef.current) {
      void ctxRef.current.close().catch(() => undefined);
      ctxRef.current = null;
      destRef.current = null;
    }

    return blob;
  }, [stopPlayback]);

  return {
    speaking,
    recording,
    start,
    stop,
    playBase64Mp3,
    stopPlayback,
  };
}
