"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export const SPEECH_SILENCE_MS = 1800;
export const SPEECH_MIN_CHARS = 12;

type UseSpeechRecognitionOptions = {
  silenceMs?: number;
  minChars?: number;
  onUtteranceEnd?: (transcript: string, durationMs: number) => void;
};

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    silenceMs = SPEECH_SILENCE_MS,
    minChars = SPEECH_MIN_CHARS,
    onUtteranceEnd,
  } = options;

  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const keepAliveRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef("");
  const interimRef = useRef("");
  const onUtteranceEndRef = useRef(onUtteranceEnd);
  const utteredRef = useRef(false);

  useEffect(() => {
    onUtteranceEndRef.current = onUtteranceEnd;
  }, [onUtteranceEnd]);

  useEffect(() => {
    const Recognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    setSupported(Boolean(Recognition));
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const getDurationMs = useCallback(() => {
    if (!startedAtRef.current) return 0;
    return Date.now() - startedAtRef.current;
  }, []);

  const scheduleSilenceCheck = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      const finalText = transcriptRef.current.trim();
      const stillSpeaking = interimRef.current.trim().length > 0;
      if (stillSpeaking || finalText.length < minChars || utteredRef.current) {
        return;
      }
      utteredRef.current = true;
      keepAliveRef.current = false;
      recognitionRef.current?.stop();
      setListening(false);
      onUtteranceEndRef.current?.(finalText, getDurationMs());
    }, silenceMs);
  }, [clearSilenceTimer, getDurationMs, minChars, silenceMs]);

  const stop = useCallback(() => {
    keepAliveRef.current = false;
    clearSilenceTimer();
    recognitionRef.current?.stop();
    setListening(false);
  }, [clearSilenceTimer]);

  const reset = useCallback(() => {
    clearSilenceTimer();
    utteredRef.current = false;
    transcriptRef.current = "";
    interimRef.current = "";
    setTranscript("");
    setInterim("");
    setError(null);
    startedAtRef.current = null;
  }, [clearSilenceTimer]);

  const start = useCallback(() => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    clearSilenceTimer();
    utteredRef.current = false;
    keepAliveRef.current = true;
    recognitionRef.current?.abort();

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalChunk += result[0].transcript;
        else interimChunk += result[0].transcript;
      }

      if (finalChunk) {
        const next = `${transcriptRef.current} ${finalChunk}`.trim();
        transcriptRef.current = next;
        setTranscript(next);
      }

      interimRef.current = interimChunk.trim();
      setInterim(interimChunk.trim());

      if (finalChunk || interimChunk) {
        scheduleSilenceCheck();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") {
        return;
      }
      setError(`Speech recognition error: ${event.error}`);
      keepAliveRef.current = false;
      setListening(false);
    };

    recognition.onend = () => {
      if (keepAliveRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // Restart can race; retry shortly.
          setTimeout(() => {
            if (!keepAliveRef.current) return;
            try {
              recognition.start();
            } catch {
              setListening(false);
            }
          }, 120);
          return;
        }
      }
      setListening(false);
    };

    recognitionRef.current = recognition;
    if (!startedAtRef.current) {
      startedAtRef.current = Date.now();
    }
    setError(null);
    setListening(true);
    try {
      recognition.start();
    } catch {
      setError("Could not start microphone listening.");
      setListening(false);
    }
  }, [clearSilenceTimer, scheduleSilenceCheck]);

  useEffect(
    () => () => {
      keepAliveRef.current = false;
      clearSilenceTimer();
      recognitionRef.current?.abort();
    },
    [clearSilenceTimer],
  );

  return {
    supported,
    listening,
    transcript,
    interim,
    error,
    start,
    stop,
    reset,
    getDurationMs,
    setTranscript,
  };
}
