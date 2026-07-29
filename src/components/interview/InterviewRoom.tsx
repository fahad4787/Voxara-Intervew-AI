"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { Square } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { saveInterviewClient } from "@/lib/db/interviews.client";
import { uploadInterviewRecording } from "@/lib/firebase/storage";
import { useAnswerRecorder } from "@/hooks/useAnswerRecorder";
import { useMediaStream } from "@/hooks/useMediaStream";
import { useSessionRecorder } from "@/hooks/useSessionRecorder";
import {
  SPEECH_MIN_CHARS,
  SPEECH_SILENCE_MS,
  useSpeechRecognition,
} from "@/hooks/useSpeechRecognition";
import { buildClosingMessage } from "@/lib/interview/closing";
import type { InterviewMessage, InterviewSession } from "@/types/interview";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { Textarea } from "@/components/ui/Textarea";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { InterviewComplete } from "@/components/interview/InterviewComplete";
import { ConsentGate } from "@/components/interview/ConsentGate";
import { VideoPreview } from "@/components/interview/VideoPreview";
import { AudioVisualizer } from "@/components/interview/AudioVisualizer";
import { TranscriptPanel } from "@/components/interview/TranscriptPanel";
import { Spinner } from "@/components/ui/Progress";
import { cn } from "@/lib/utils/cn";

type TurnResponse = {
  session: InterviewSession;
  reply: string;
  shouldEnd: boolean;
  audioBase64?: string;
  persisted?: boolean;
};

type CompleteResponse = InterviewSession & { persisted?: boolean };

type ListenState = "idle" | "listening" | "processing" | "speaking";

const LISTENING_ACKS = ["Mm-hmm.", "Got it.", "Okay.", "Nice."] as const;
const POST_ANSWER_TARGET_MS = 2800;
const POST_ANSWER_MAX_MS = 5000;

function formatClock(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function transcriptLooksSolid(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return text.trim().length >= 36 || words.length >= 7;
}

async function fetchSpeechBase64(text: string): Promise<string | null> {
  try {
    const response = await fetch("/api/interview/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
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

async function transcribeWithWhisper(blob: Blob): Promise<string | null> {
  try {
    const form = new FormData();
    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    form.append("audio", blob, `answer.${ext}`);
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

export function InterviewRoom({
  initialSession,
  onCompleted,
}: {
  initialSession: InterviewSession;
  onCompleted?: () => void;
}) {
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
        const audioBase64 = await fetchSpeechBase64(text);
        if (audioBase64) {
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
    const clips = await Promise.all(
      LISTENING_ACKS.map((phrase) => fetchSpeechBase64(phrase)),
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
      else if (
        withRecording.recordingUrl &&
        !nextSession.recordingUrl
      ) {
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
          const whisperText = await transcribeWithWhisper(audioBlob);
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

        stopPlayback();
        setListenState("speaking");
        if (result.audioBase64) {
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
      const blob = await recorder.stop();
      void submitAnswer(transcript, durationMs, blob);
    },
  );

  const onBackchannel = useEffectEvent(() => {
    if (phaseRef.current !== "live" || submitLockRef.current) return;
    playListeningAck();
  });

  const speech = useSpeechRecognition({
    silenceMs: SPEECH_SILENCE_MS,
    minChars: SPEECH_MIN_CHARS,
    onUtteranceEnd,
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
    const elapsedSec = Math.max(0, Math.floor((nowTs - started) / 1000));
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
  }, [nowTs, session.durationMinutes, session.startedAt]);

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
    if (phase !== "live" || busy || avaSpeaking || !speech.supported) {
      return;
    }

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
  }, [phase, busy, avaSpeaking, speech.supported]);

  useEffect(() => {
    if (avaSpeaking) setListenState("speaking");
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

  if (phase === "consent") {
    return (
      <ConsentGate
        candidateName={session.candidateName}
        stream={media.stream}
        mediaError={media.error}
        onEnableMedia={() => void media.start()}
        onAccept={() => void acceptConsent()}
        loading={busy}
      />
    );
  }

  if (phase === "completed") {
    return <InterviewComplete session={session} />;
  }

  const liveTranscript = [speech.transcript, speech.interim]
    .filter(Boolean)
    .join(" ")
    .trim();

  const statusLabel =
    listenState === "speaking"
      ? "Ava is speaking"
      : listenState === "processing"
        ? "Thinking…"
        : listenState === "listening"
          ? "Listening — speak naturally"
          : "Ready";

  const statusTone =
    listenState === "speaking"
      ? "brand"
      : listenState === "processing"
        ? "warning"
        : listenState === "listening"
          ? "danger"
          : "neutral";

  const helperText = !speech.supported
    ? "Type your answer. We’ll send it after a short pause."
    : listenState === "listening"
      ? "I’m listening. Pause when you’re done — I’ll take that as your answer."
      : listenState === "processing"
        ? "Thanks — taking a moment, then Ava’s next question…"
        : listenState === "speaking"
          ? "Listen to Ava. Your mic will open automatically when she finishes."
          : "Waiting…";

  return (
    <>
      <div className="grid items-start gap-4 lg:grid-cols-[1.35fr_0.9fr]">
        <Card className="overflow-hidden shadow-[var(--shadow-lift)]">
          <div className="consent-stage relative bg-[var(--stage)] p-4">
            <div className="consent-stage-glow" aria-hidden />
            <div className="consent-stage-grille" aria-hidden />
            <VideoPreview
              stream={media.stream}
              className="relative z-[1] aspect-video w-full border border-white/10"
            />
            <div className="absolute left-7 top-7 z-[2] flex flex-wrap items-center gap-2 sm:left-8 sm:top-8">
              <Badge
                tone={statusTone}
                className="inline-flex items-center gap-2"
              >
                <span
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full",
                    listenState === "listening"
                      ? "bg-rose-400 rec-dot"
                      : listenState === "speaking"
                        ? "bg-[var(--accent)] rec-dot"
                        : "bg-current opacity-70",
                  )}
                />
                {statusLabel}
              </Badge>
              {sessionRecording ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[var(--ink)]/70 px-3 py-1.5 font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-[var(--stage-ink)]">
                  <span className="rec-dot inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Rec
                </span>
              ) : null}
            </div>
            <div className="absolute bottom-7 left-7 right-7 z-[2] rounded-2xl border border-white/10 bg-[var(--ink)]/80 p-4 text-[var(--stage-ink)]">
              <p className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.16em] text-[var(--stage-muted)]">
                Current question
              </p>
              <p className="mt-1 text-sm leading-relaxed sm:text-base">
                {latestQuestion}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                Session timer
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className={cn(
                    "font-[family-name:var(--font-display)] text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl",
                    timer.overtime
                      ? "text-amber-700"
                      : "text-[var(--ink)]",
                  )}
                >
                  {timer.overtime ? "+" : ""}
                  {timer.overtime ? timer.remainingLabel : timer.elapsedLabel}
                </span>
                <span className="font-[family-name:var(--font-data)] text-sm tabular-nums text-[var(--ink-muted)]">
                  / {timer.targetLabel}
                </span>
                {timer.overtime ? (
                  <Badge tone="warning" className="ml-1">
                    Wrapping up
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="w-full sm:max-w-[14rem]">
              <div className="mb-1.5 flex items-center justify-between font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                <span>Progress</span>
                <span className="tabular-nums">
                  {Math.round(timer.progress)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500 ease-out",
                    timer.overtime ? "bg-amber-500" : "bg-[var(--accent)]",
                  )}
                  style={{ width: `${timer.progress}%` }}
                />
              </div>
            </div>
          </div>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AudioVisualizer
                  active={
                    listenState === "listening" || listenState === "speaking"
                  }
                />
                <div>
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {session.title}
                  </p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {session.durationMinutes} min · {session.difficulty}
                    {sessionRecording ? " · recording" : ""}
                  </p>
                </div>
              </div>
              <Button
                variant="dangerGhost"
                size="sm"
                onClick={() => setEndConfirmOpen(true)}
                disabled={busy && listenState === "processing"}
                leadingIcon={Square}
              >
                End interview
              </Button>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-[family-name:var(--font-data)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                  Live transcript
                </p>
                {listenState === "processing" ? (
                  <Spinner className="h-4 w-4" />
                ) : null}
              </div>
              <p className="min-h-16 text-sm text-[var(--ink)]">
                {liveTranscript || manualFallback || helperText}
              </p>
            </div>

            {!speech.supported ? (
              <Textarea
                label="Type your answer"
                value={manualFallback}
                onChange={(e) => onManualChange(e.target.value)}
                placeholder="Type naturally — pause briefly to send…"
                disabled={busy || avaSpeaking}
              />
            ) : null}

            {error ? <InlineAlert>{error}</InlineAlert> : null}
            {speech.error ? (
              <InlineAlert tone="warning">{speech.error}</InlineAlert>
            ) : null}
          </CardContent>
        </Card>

        <Card className="flex max-h-[min(40rem,calc(100dvh-5.5rem))] flex-col overflow-hidden shadow-[var(--shadow-soft)] lg:sticky lg:top-4">
          <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            <div className="flex shrink-0 items-center justify-between">
              <div>
                <p className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                  Conversation
                </p>
                <h3 className="mt-0.5 font-medium text-[var(--ink)]">
                  With Ava
                </h3>
              </div>
              <Badge>{session.messages.length} turns</Badge>
            </div>
            <TranscriptPanel
              messages={session.messages as InterviewMessage[]}
              className="min-h-0 flex-1 pr-1"
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        open={endConfirmOpen}
        onClose={() => setEndConfirmOpen(false)}
        onConfirm={finishInterview}
        title="End interview?"
        description={
          answerCount === 0
            ? "You haven’t answered any questions yet. Ending now will mark this as incomplete with a no-hire signal — no fabricated scorecard."
            : "This will save the session recording and generate the final report from your answers so far."
        }
        confirmLabel={
          answerCount === 0 ? "End as incomplete" : "End & generate report"
        }
        loading={busy && listenState === "processing"}
      />
    </>
  );
}
