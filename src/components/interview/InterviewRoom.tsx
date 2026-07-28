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
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useMediaStream } from "@/hooks/useMediaStream";
import {
  SPEECH_MIN_CHARS,
  SPEECH_SILENCE_MS,
  useSpeechRecognition,
} from "@/hooks/useSpeechRecognition";
import { buildClosingMessage } from "@/lib/openai/prompts";
import type { InterviewMessage, InterviewSession } from "@/types/interview";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { InterviewComplete } from "@/components/interview/InterviewComplete";
import { ConsentGate } from "@/components/interview/ConsentGate";
import { VideoPreview } from "@/components/interview/VideoPreview";
import { AudioVisualizer } from "@/components/interview/AudioVisualizer";
import { TranscriptPanel } from "@/components/interview/TranscriptPanel";
import { Spinner } from "@/components/ui/Progress";

type TurnResponse = {
  session: InterviewSession;
  reply: string;
  shouldEnd: boolean;
  audioBase64?: string;
  persisted?: boolean;
};

type CompleteResponse = InterviewSession & { persisted?: boolean };

type ListenState = "idle" | "listening" | "processing" | "speaking";

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

  const media = useMediaStream();
  const audio = useAudioPlayer();
  const submitLockRef = useRef(false);
  const typedSilenceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef(session);
  const phaseRef = useRef(phase);
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

  const persistSession = useCallback((next: InterviewSession) => {
    void saveInterviewClient(next).catch((err) => {
      console.warn("Failed to persist interview", err);
    });
  }, []);

  const speakText = useCallback(
    async (text: string) => {
      try {
        setListenState("speaking");
        const response = await fetch("/api/interview/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          success: boolean;
          data?: { audioBase64: string };
        };
        if (payload.success && payload.data?.audioBase64) {
          await audio.playBase64Mp3(payload.data.audioBase64);
        }
      } catch {
        // Voice is best-effort; interview continues with text.
      }
    },
    [audio],
  );

  const submitAnswer = useEffectEvent(
    async (transcript: string, durationMs: number) => {
      const cleaned = transcript.trim();
      if (!cleaned || submitLockRef.current || phaseRef.current !== "live") {
        return;
      }

      submitLockRef.current = true;
      setBusy(true);
      setListenState("processing");
      setError(null);
      speechRef.current.stop();
      audio.stop();

      try {
        const current = sessionRef.current;
        const result = await apiFetch<TurnResponse>("/api/interview/turn", {
          method: "POST",
          body: JSON.stringify({
            token: current.token,
            transcript: cleaned,
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

        setListenState("speaking");
        if (result.audioBase64) {
          await audio.playBase64Mp3(result.audioBase64);
        } else {
          await speakText(result.reply);
        }

        if (result.shouldEnd || nextSession.status === "completed") {
          setPhase("completed");
          setListenState("idle");
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
    (transcript: string, durationMs: number) => {
      void submitAnswer(transcript, durationMs);
    },
  );

  const speech = useSpeechRecognition({
    silenceMs: SPEECH_SILENCE_MS,
    minChars: SPEECH_MIN_CHARS,
    onUtteranceEnd,
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

  useEffect(() => {
    if (phase === "live" && !media.stream) {
      void media.start();
    }
  }, [phase, media]);

  useEffect(() => {
    if (phase !== "live" || busy || audio.speaking || !speech.supported) {
      return;
    }

    setListenState("listening");
    speech.reset();
    speech.start();

    return () => {
      speech.stop();
    };
    // Intentionally depend on conversation gates only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, busy, audio.speaking, speech.supported]);

  useEffect(() => {
    if (audio.speaking) setListenState("speaking");
  }, [audio.speaking]);

  const acceptConsent = async () => {
    setBusy(true);
    setError(null);
    try {
      if (!media.stream) {
        const started = await media.start();
        if (!started) {
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
      setListenState("speaking");
      await speakText(updated.messages[0]?.content || latestQuestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start");
    } finally {
      setBusy(false);
    }
  };

  const [endConfirmOpen, setEndConfirmOpen] = useState(false);

  const answerCount = useMemo(
    () => session.messages.filter((m) => m.role === "candidate").length,
    [session.messages],
  );

  const finishInterview = async () => {
    setBusy(true);
    setError(null);
    speech.stop();
    audio.stop();
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

      setListenState("processing");
      const completed = await apiFetch<CompleteResponse>(
        `/api/interviews/${session.id}/complete`,
        {
          method: "POST",
          body: JSON.stringify({
            token: withClosing.token,
            session: withClosing,
          }),
        },
      );

      const { persisted, ...nextSession } = completed;
      setSession(nextSession);
      if (!persisted) persistSession(nextSession);
      setPhase("completed");
      setListenState("idle");
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
      void submitAnswer(value, 0);
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
    audio.stop();
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
        ? "Got it. Ava is preparing the next question…"
        : listenState === "speaking"
          ? "Listen to Ava. Your mic will open automatically when she finishes."
          : "Waiting…";

  return (
    <>
    <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
      <Card className="overflow-hidden">
        <div className="relative bg-[#0b1220] p-4">
          <VideoPreview
            stream={media.stream}
            className="aspect-video w-full"
          />
          <div className="absolute left-7 top-7 flex items-center gap-2">
            <Badge tone={statusTone}>{statusLabel}</Badge>
          </div>
          <div className="absolute bottom-7 left-7 right-7 rounded-2xl bg-black/70 p-4 text-white">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">
              Current question
            </p>
            <p className="mt-1 text-sm leading-relaxed sm:text-base">
              {latestQuestion}
            </p>
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
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEndConfirmOpen(true)}
              disabled={busy && listenState === "processing"}
            >
              <Square className="h-3.5 w-3.5" />
              End interview
            </Button>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
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
              disabled={busy || audio.speaking}
            />
          ) : null}

          {error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          {speech.error ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {speech.error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex h-full min-h-[28rem] flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[var(--ink)]">Conversation</h3>
            <Badge>{session.messages.length} turns</Badge>
          </div>
          <TranscriptPanel
            messages={session.messages as InterviewMessage[]}
            className="flex-1 pr-1"
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
            : "This will generate the final report from your answers so far."
        }
        confirmLabel={answerCount === 0 ? "End as incomplete" : "End & generate report"}
        loading={busy && listenState === "processing"}
      />
    </>
  );
}
