"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { nanoid } from "nanoid";
import { apiFetch } from "@/lib/api/client";
import { saveInterviewClient } from "@/lib/db/interviews.client";
import { uploadInterviewRecording } from "@/lib/firebase/storage";
import { buildClosingMessage } from "@/lib/interview/closing";
import {
  fetchSpeechBase64,
  transcriptLooksSolid,
  transcribeWithWhisper,
} from "@/lib/interview/voice-api";
import { useAnswerRecorder } from "@/hooks/useAnswerRecorder";
import { useMediaStream } from "@/hooks/useMediaStream";
import { useSessionRecorder } from "@/hooks/useSessionRecorder";
import {
  SPEECH_MIN_CHARS,
  SPEECH_SILENCE_MS,
  useSpeechRecognition,
} from "@/hooks/useSpeechRecognition";
import type { InterviewMessage, InterviewSession } from "@/types/interview";

type TurnResponse = {
  session: InterviewSession;
  reply: string;
  shouldEnd: boolean;
  audioBase64?: string;
  persisted?: boolean;
};

type CompleteResponse = InterviewSession & { persisted?: boolean };

export type ListenState = "idle" | "listening" | "processing" | "speaking";

const LISTENING_ACKS = ["Mm-hmm.", "Got it.", "Okay.", "Nice."] as const;
const POST_ANSWER_TARGET_MS = 2800;
const POST_ANSWER_MAX_MS = 5000;

export function formatClock(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function useInterviewRoom(
  initialSession: InterviewSession,
  onCompleted?: () => void,
) {
  const [session, setSession] = useState(initialSession);
  const [phase, setPhase] = useState<"consent" | "live" | "completed">(
    initialSession.status === "completed"
      ? "completed"
      : initialSession.consentAccepted
        ? "live"
        : "consent",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualFallback, setManualFallback] = useState("");
  const [listenState, setListenState] = useState<ListenState>("idle");
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [endConfirmOpen, setEndConfirmOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pauseStartedAt, setPauseStartedAt] = useState<number | null>(null);
  const [pausedAccumulated, setPausedAccumulated] = useState(0);

  const media = useMediaStream();
  const {
    speaking: avaSpeaking,
    recording: sessionRecording,
    start: startSessionRec,
    stop: stopSessionRec,
    playBase64Mp3,
    stopPlayback,
  } = useSessionRecorder();
  const recorder = useAnswerRecorder();
  const submitLockRef = useRef(false);
  const typedSilenceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef(session);
  const phaseRef = useRef(phase);
  const mediaStreamRef = useRef(media.stream);
  const ackAudioRef = useRef<string[]>([]);
  const ackIndexRef = useRef(0);
  const lastQuestionAudioRef = useRef<{ text: string; audio: string } | null>(
    null,
  );
  const pausedRef = useRef(false);
  const pauseStartedAtRef = useRef<number | null>(null);
  const speechRef = useRef<{
    start: () => void;
    stop: () => void;
    reset: () => void;
  }>({
    start: () => {},
    stop: () => {},
    reset: () => {},
  });

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    mediaStreamRef.current = media.stream;
  }, [media.stream]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (phase !== "live") return;
    const id = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const persistSession = useCallback((next: InterviewSession) => {
    void saveInterviewClient(next).catch((err) => {
      console.warn("Failed to persist interview", err);
    });
  }, []);

  const speakText = useCallback(
    async (text: string) => {
      try {
        setListenState("speaking");
        const audioBase64 = await fetchSpeechBase64(
          text,
          sessionRef.current.token,
        );
        if (audioBase64) {
          lastQuestionAudioRef.current = { text, audio: audioBase64 };
          await playBase64Mp3(audioBase64);
        }
      } catch {
        // Voice is best-effort; interview continues with text.
      }
    },
    [playBase64Mp3],
  );

  const prefetchListeningAcks = useCallback(async () => {
    if (ackAudioRef.current.length > 0) return;
    const token = sessionRef.current.token;
    const clips = await Promise.all(
      LISTENING_ACKS.map((phrase) => fetchSpeechBase64(phrase, token)),
    );
    ackAudioRef.current = clips.filter((clip): clip is string => Boolean(clip));
  }, []);

  const playListeningAck = useCallback(() => {
    const clips = ackAudioRef.current;
    if (clips.length === 0) return;
    const clip = clips[ackIndexRef.current % clips.length]!;
    ackIndexRef.current += 1;
    void playBase64Mp3(clip, { soft: true }).catch(() => undefined);
  }, [playBase64Mp3]);

  const waitBeforeNextQuestion = useCallback(async (answerEndedAt: number) => {
    const sinceEnd = Date.now() - answerEndedAt;
    const remaining = Math.min(
      POST_ANSWER_MAX_MS - sinceEnd,
      Math.max(0, POST_ANSWER_TARGET_MS - sinceEnd),
    );
    if (remaining > 200) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, remaining);
      });
    }
  }, []);

  const replayCurrentQuestion = useCallback(async () => {
    const question =
      sessionRef.current.messages.filter((m) => m.role === "assistant").at(-1)
        ?.content || "";
    if (!question) return;

    speechRef.current.stop();
    void recorder.stop();
    stopPlayback();
    setListenState("speaking");

    const cached = lastQuestionAudioRef.current;
    try {
      if (cached?.text === question && cached.audio) {
        await playBase64Mp3(cached.audio);
      } else {
        await speakText(question);
      }
    } catch {
      // best-effort
    }
  }, [playBase64Mp3, recorder, speakText, stopPlayback]);

  const pauseInterview = useCallback(() => {
    if (pausedRef.current) return;
    speechRef.current.stop();
    void recorder.stop();
    stopPlayback();
    pauseStartedAtRef.current = Date.now();
    setPauseStartedAt(Date.now());
    setPaused(true);
    setListenState("idle");
  }, [recorder, stopPlayback]);

  const resumeInterview = useCallback(() => {
    if (!pausedRef.current) return;
    const started = pauseStartedAtRef.current;
    if (started) {
      setPausedAccumulated((total) => total + (Date.now() - started));
    }
    pauseStartedAtRef.current = null;
    setPauseStartedAt(null);
    setPaused(false);
    void replayCurrentQuestion();
  }, [replayCurrentQuestion]);

  const attachRecording = useCallback(
    async (current: InterviewSession): Promise<InterviewSession> => {
      const blob = await stopSessionRec();
      if (!blob || blob.size < 1000) return current;

      try {
        const uploaded = await uploadInterviewRecording(current.id, blob);
        return {
          ...current,
          recordingUrl: uploaded.url,
          recordingPath: uploaded.path,
          updatedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.warn("Failed to upload interview recording", err);
        return current;
      }
    },
    [stopSessionRec],
  );

  const completeSession = useCallback(
    async (current: InterviewSession) => {
      setListenState("processing");
      const withRecording = await attachRecording(current);
      const completed = await apiFetch<CompleteResponse>(
        `/api/interviews/${withRecording.id}/complete`,
        {
          method: "POST",
          body: JSON.stringify({
            token: withRecording.token,
            session: withRecording,
          }),
        },
      );
      const { persisted, ...nextSession } = completed;
      const merged: InterviewSession = {
        ...nextSession,
        recordingUrl: nextSession.recordingUrl ?? withRecording.recordingUrl,
        recordingPath: nextSession.recordingPath ?? withRecording.recordingPath,
      };
      setSession(merged);
      if (!persisted) persistSession(merged);
      else if (withRecording.recordingUrl && !nextSession.recordingUrl) {
        persistSession(merged);
      }
      setPhase("completed");
      setListenState("idle");
    },
    [attachRecording, persistSession],
  );

  const submitAnswer = useEffectEvent(
    async (transcript: string, durationMs: number, audioBlob?: Blob | null) => {
      const cleaned = transcript.trim();
      if (!cleaned || submitLockRef.current || phaseRef.current !== "live") {
        return;
      }

      const answerEndedAt = Date.now();
      submitLockRef.current = true;
      setBusy(true);
      setListenState("processing");
      setError(null);
      speechRef.current.stop();
      stopPlayback();

      try {
        let finalText = cleaned;
        const needsWhisper =
          Boolean(audioBlob && audioBlob.size > 1200) &&
          !transcriptLooksSolid(cleaned);

        if (needsWhisper && audioBlob) {
          const whisperText = await transcribeWithWhisper(
            audioBlob,
            sessionRef.current.token,
          );
          if (whisperText && whisperText.length >= 3) {
            finalText = whisperText;
          }
        }

        const current = sessionRef.current;
        const result = await apiFetch<TurnResponse>("/api/interview/turn", {
          method: "POST",
          body: JSON.stringify({
            token: current.token,
            transcript: finalText,
            durationMs,
            session: current,
          }),
        });

        const nextSession = result.session;
        setSession(nextSession);
        if (!result.persisted) {
          persistSession(nextSession);
        }

        speechRef.current.reset();
        setManualFallback("");

        await waitBeforeNextQuestion(answerEndedAt);

        if (pausedRef.current) {
          return;
        }

        stopPlayback();
        setListenState("speaking");
        if (result.audioBase64) {
          lastQuestionAudioRef.current = {
            text: result.reply,
            audio: result.audioBase64,
          };
          await playBase64Mp3(result.audioBase64);
        } else {
          await speakText(result.reply);
        }

        if (result.shouldEnd) {
          await completeSession(nextSession);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send answer");
      } finally {
        submitLockRef.current = false;
        setBusy(false);
      }
    },
  );

  const onUtteranceEnd = useEffectEvent(
    async (transcript: string, durationMs: number) => {
      if (pausedRef.current) return;
      const blob = await recorder.stop();
      void submitAnswer(transcript, durationMs, blob);
    },
  );

  const onBackchannel = useEffectEvent(() => {
    if (
      phaseRef.current !== "live" ||
      submitLockRef.current ||
      pausedRef.current
    ) {
      return;
    }
    playListeningAck();
  });

  const speech = useSpeechRecognition({
    silenceMs: SPEECH_SILENCE_MS,
    minChars: SPEECH_MIN_CHARS,
    // Effect Events are consumed inside useSpeechRecognition effect callbacks.
    // eslint-disable-next-line react-hooks/rules-of-hooks -- intentional Effect Event wiring
    onUtteranceEnd,
    // eslint-disable-next-line react-hooks/rules-of-hooks -- intentional Effect Event wiring
    onBackchannel,
  });

  useEffect(() => {
    speechRef.current = {
      start: speech.start,
      stop: speech.stop,
      reset: speech.reset,
    };
  }, [speech.start, speech.stop, speech.reset]);

  const latestQuestion = useMemo(() => {
    const assistants = session.messages.filter((m) => m.role === "assistant");
    return assistants[assistants.length - 1]?.content || "";
  }, [session.messages]);

  const timer = useMemo(() => {
    const started = session.startedAt
      ? new Date(session.startedAt).getTime()
      : nowTs;
    const livePause = pauseStartedAt ? nowTs - pauseStartedAt : 0;
    const elapsedSec = Math.max(
      0,
      Math.floor((nowTs - started - pausedAccumulated - livePause) / 1000),
    );
    const targetSec = session.durationMinutes * 60;
    const remainingSec = targetSec - elapsedSec;
    return {
      elapsedSec,
      elapsedLabel: formatClock(elapsedSec),
      remainingLabel: formatClock(Math.abs(remainingSec)),
      targetLabel: formatClock(targetSec),
      overtime: remainingSec < 0,
      progress: Math.min(100, (elapsedSec / Math.max(targetSec, 1)) * 100),
    };
  }, [
    nowTs,
    pauseStartedAt,
    pausedAccumulated,
    session.durationMinutes,
    session.startedAt,
  ]);

  useEffect(() => {
    if (phase === "live" && !media.stream) {
      void media.start();
    }
  }, [phase, media]);

  useEffect(() => {
    if (phase === "live") {
      void prefetchListeningAcks();
    }
  }, [phase, prefetchListeningAcks]);

  useEffect(() => {
    if (phase !== "live" || !media.stream || sessionRecording) return;
    void startSessionRec(media.stream);
  }, [phase, media.stream, sessionRecording, startSessionRec]);

  useEffect(() => {
    if (
      phase !== "live" ||
      busy ||
      avaSpeaking ||
      paused ||
      !speech.supported
    ) {
      return;
    }

    // Sync listen UI + start capture when Ava finishes / pause clears.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gate-driven listen cycle
    setListenState("listening");
    speech.reset();
    speech.start();
    recorder.start(mediaStreamRef.current);

    return () => {
      speech.stop();
      void recorder.stop();
    };
    // Intentionally depend on conversation gates only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, busy, avaSpeaking, paused, speech.supported]);

  useEffect(() => {
    if (avaSpeaking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirror recorder speaking flag
      setListenState("speaking");
    }
  }, [avaSpeaking]);

  const acceptConsent = async () => {
    setBusy(true);
    setError(null);
    try {
      let stream = media.stream;
      if (!stream) {
        stream = await media.start();
        if (!stream) {
          setBusy(false);
          return;
        }
      }

      const updated: InterviewSession = {
        ...session,
        consentAccepted: true,
        status: session.status === "ready" ? "in_progress" : session.status,
        startedAt: session.startedAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSession(updated);
      persistSession(updated);
      setPhase("live");
      await startSessionRec(stream);
      void prefetchListeningAcks();
      setListenState("speaking");
      await speakText(updated.messages[0]?.content || latestQuestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start");
    } finally {
      setBusy(false);
    }
  };

  const answerCount = useMemo(
    () => session.messages.filter((m) => m.role === "candidate").length,
    [session.messages],
  );

  const finishInterview = async () => {
    setBusy(true);
    setError(null);
    speech.stop();
    stopPlayback();
    void recorder.stop();
    setListenState("speaking");
    setEndConfirmOpen(false);

    try {
      const closing = buildClosingMessage(session);
      const withClosing: InterviewSession = {
        ...session,
        messages: [
          ...session.messages,
          {
            id: nanoid(10),
            role: "assistant",
            content: closing,
            createdAt: new Date().toISOString(),
          },
        ],
        updatedAt: new Date().toISOString(),
      };
      setSession(withClosing);
      persistSession(withClosing);
      await speakText(closing);
      await completeSession(withClosing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete");
    } finally {
      setBusy(false);
    }
  };

  const onManualChange = (value: string) => {
    setManualFallback(value);
    if (typedSilenceRef.current) clearTimeout(typedSilenceRef.current);
    if (value.trim().length < SPEECH_MIN_CHARS) return;
    typedSilenceRef.current = setTimeout(() => {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Effect Event from timer callback
      void submitAnswer(value, 0, null);
    }, SPEECH_SILENCE_MS);
  };

  useEffect(
    () => () => {
      if (typedSilenceRef.current) clearTimeout(typedSilenceRef.current);
    },
    [],
  );

  useEffect(() => {
    if (phase !== "completed") return;
    media.stop();
    speech.stop();
    stopPlayback();
    onCompleted?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const liveTranscript = [speech.transcript, speech.interim]
    .filter(Boolean)
    .join(" ")
    .trim();

  const statusLabel = paused
    ? "Paused"
    : listenState === "speaking"
      ? "Ava is speaking"
      : listenState === "processing"
        ? "Thinking…"
        : listenState === "listening"
          ? "Listening — speak naturally"
          : "Ready";

  const statusTone: "neutral" | "brand" | "warning" | "danger" = paused
    ? "neutral"
    : listenState === "speaking"
      ? "brand"
      : listenState === "processing"
        ? "warning"
        : listenState === "listening"
          ? "danger"
          : "neutral";

  const helperText = paused
    ? "Interview paused. Press Play to hear the question again and continue."
    : !speech.supported
      ? "Type your answer. We’ll send it after a short pause."
      : listenState === "listening"
        ? "I’m listening. Pause when you’re done — I’ll take that as your answer."
        : listenState === "processing"
          ? "Thanks — taking a moment, then Ava’s next question…"
          : listenState === "speaking"
            ? "Listen to Ava. Your mic will open automatically when she finishes."
            : "Waiting…";

  const controlsLocked = busy && listenState === "processing";
  const canReplay = Boolean(latestQuestion) && !controlsLocked;

  return {
    session,
    phase,
    busy,
    error,
    manualFallback,
    listenState,
    endConfirmOpen,
    setEndConfirmOpen,
    paused,
    media,
    avaSpeaking,
    sessionRecording,
    speech,
    latestQuestion,
    timer,
    answerCount,
    liveTranscript,
    statusLabel,
    statusTone,
    helperText,
    controlsLocked,
    canReplay,
    messages: session.messages as InterviewMessage[],
    acceptConsent,
    finishInterview,
    onManualChange,
    replayCurrentQuestion,
    pauseInterview,
    resumeInterview,
  };
}
