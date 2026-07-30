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

/**
 * Full-session mix recorder.
 * - Mic → gain → dest (gain ducks while Ava speaks to avoid speaker echo loops)
 * - Ava TTS → speakers + dest (digital mix only; soft acks stay speakers-only)
 * - MediaRecorder records one continuous blob (no 1s timeslice)
 */
export function useSessionRecorder() {
  const ctxRef = useRef<AudioContext | null>(null);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micGainRef = useRef<GainNode | null>(null);
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

  const setMicOpen = useCallback((open: boolean) => {
    const gain = micGainRef.current;
    const ctx = ctxRef.current;
    if (!gain || !ctx) return;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    // Soft ramp avoids clicks; keep a tiny floor so the graph stays live.
    gain.gain.setTargetAtTime(open ? 1 : 0.02, now, 0.03);
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
        micGainRef.current?.disconnect();

        const micSource = ctx.createMediaStreamSource(
          new MediaStream(audioTracks),
        );
        const micGain = ctx.createGain();
        micGain.gain.value = 1;
        micSource.connect(micGain);
        micGain.connect(dest);
        micSourceRef.current = micSource;
        micGainRef.current = micGain;

        chunksRef.current = [];
        const mimeType = pickMimeType();
        mimeRef.current = mimeType;
        const recorder = mimeType
          ? new MediaRecorder(dest.stream, {
              mimeType,
              audioBitsPerSecond: 128000,
            })
          : new MediaRecorder(dest.stream);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        recorderRef.current = recorder;
        // No timeslice — one continuous WebM avoids ~1s cluster stutter on playback.
        recorder.start();
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
    setMicOpen(true);
    setSpeaking(false);
  }, [setMicOpen]);

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
        // Always play to speakers.
        source.connect(ctx.destination);
        // Soft listening acks stay speakers-only so they don't layer into the file.
        // Full Ava lines go into the mix digitally; mic is ducked to avoid echo loops.
        if (dest && !soft) {
          source.connect(dest);
          setMicOpen(false);
        }
        ttsSourceRef.current = source;
        if (!soft) setSpeaking(true);

        await new Promise<void>((resolve, reject) => {
          source.onended = () => {
            if (ttsSourceRef.current === source) {
              ttsSourceRef.current = null;
              if (!soft) {
                setMicOpen(true);
                setSpeaking(false);
              }
            }
            resolve();
          };
          try {
            source.start(0);
          } catch (error) {
            if (!soft) {
              setMicOpen(true);
              setSpeaking(false);
            }
            reject(error);
          }
        });
      } catch {
        if (!soft) setSpeaking(false);
        const url = `data:audio/mpeg;base64,${base64}`;
        const audio = new Audio(url);
        if (!soft) {
          setMicOpen(false);
          setSpeaking(true);
        }
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            if (!soft) {
              setMicOpen(true);
              setSpeaking(false);
            }
            resolve();
          };
          audio.onerror = () => {
            if (!soft) {
              setMicOpen(true);
              setSpeaking(false);
            }
            reject(new Error("Failed to play audio"));
          };
          void audio.play().catch(reject);
        });
      }
    },
    [ensureContext, setMicOpen, stopPlayback],
  );

  const stop = useCallback(async (): Promise<Blob | null> => {
    stopPlayback();

    const recorder = recorderRef.current;
    micSourceRef.current?.disconnect();
    micSourceRef.current = null;
    micGainRef.current?.disconnect();
    micGainRef.current = null;

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
        // Flush any buffered data then stop for a clean single blob.
        if (recorder.state === "recording") {
          try {
            recorder.requestData();
          } catch {
            // optional
          }
          recorder.stop();
        } else {
          recorder.stop();
        }
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
