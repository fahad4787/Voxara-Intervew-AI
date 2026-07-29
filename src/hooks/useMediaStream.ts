"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setReady(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = media;
      setStream(media);
      setReady(true);
      return media;
    } catch {
      setError(
        "Camera or microphone permission is required to start the interview.",
      );
      setReady(false);
      return null;
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { stream, ready, error, start, stop };
}
