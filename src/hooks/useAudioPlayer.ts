"use client";

import { useCallback, useRef, useState } from "react";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  const playUrl = useCallback(
    async (url: string) => {
      stop();
      const audio = new Audio(url);
      audioRef.current = audio;
      setSpeaking(true);

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          setSpeaking(false);
          resolve();
        };
        audio.onerror = () => {
          setSpeaking(false);
          reject(new Error("Failed to play audio"));
        };
        void audio.play().catch(reject);
      });
    },
    [stop],
  );

  const playBase64Mp3 = useCallback(
    async (base64: string) => {
      const url = `data:audio/mpeg;base64,${base64}`;
      await playUrl(url);
    },
    [playUrl],
  );

  return { speaking, playUrl, playBase64Mp3, stop };
}
