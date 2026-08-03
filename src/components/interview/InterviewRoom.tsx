"use client";

import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { useInterviewRoom } from "@/hooks/useInterviewRoom";
import type { InterviewSession } from "@/types/interview";
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

export function InterviewRoom({
  initialSession,
  onCompleted,
}: {
  initialSession: InterviewSession;
  onCompleted?: () => void;
}) {
  const room = useInterviewRoom(initialSession, onCompleted);

  if (room.phase === "consent") {
    return (
      <ConsentGate
        candidateName={room.session.candidateName}
        stream={room.media.stream}
        mediaError={room.media.error}
        onEnableMedia={() => void room.media.start()}
        onAccept={() => void room.acceptConsent()}
        loading={room.busy}
      />
    );
  }

  if (room.phase === "completed") {
    return <InterviewComplete session={room.session} />;
  }

  return (
    <>
      <div className="grid items-start gap-4 lg:grid-cols-[1.35fr_0.9fr]">
        <Card className="overflow-hidden shadow-[var(--shadow-lift)]">
          <div className="consent-stage relative bg-[var(--stage)] p-4">
            <div className="consent-stage-glow" aria-hidden />
            <div className="consent-stage-grille" aria-hidden />
            <VideoPreview
              stream={room.media.stream}
              className="relative z-[1] aspect-video w-full border border-white/10"
            />
            <div className="absolute left-7 top-7 z-[2] flex flex-wrap items-center gap-2 sm:left-8 sm:top-8">
              <Badge
                tone={room.statusTone}
                className="inline-flex items-center gap-2"
              >
                <span
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full",
                    room.listenState === "listening"
                      ? "bg-rose-400 rec-dot"
                      : room.listenState === "speaking"
                        ? "bg-[var(--accent)] rec-dot"
                        : "bg-current opacity-70",
                  )}
                />
                {room.statusLabel}
              </Badge>
              {room.paused ? (
                <Badge tone="neutral" className="inline-flex items-center gap-2">
                  Paused
                </Badge>
              ) : null}
              {room.sessionRecording && !room.paused ? (
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
                {room.latestQuestion}
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
                    room.timer.overtime
                      ? "text-amber-700"
                      : "text-[var(--ink)]",
                  )}
                >
                  {room.timer.overtime ? "+" : ""}
                  {room.timer.overtime
                    ? room.timer.remainingLabel
                    : room.timer.elapsedLabel}
                </span>
                <span className="font-[family-name:var(--font-data)] text-sm tabular-nums text-[var(--ink-muted)]">
                  / {room.timer.targetLabel}
                </span>
                {room.timer.overtime ? (
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
                  {Math.round(room.timer.progress)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500 ease-out",
                    room.timer.overtime ? "bg-amber-500" : "bg-[var(--accent)]",
                  )}
                  style={{ width: `${room.timer.progress}%` }}
                />
              </div>
            </div>
          </div>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AudioVisualizer
                  active={
                    room.listenState === "listening" ||
                    room.listenState === "speaking"
                  }
                />
                <div>
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {room.session.title}
                  </p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {room.session.durationMinutes} min · {room.session.difficulty}
                    {room.sessionRecording ? " · recording" : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void room.replayCurrentQuestion()}
                  disabled={!room.canReplay || room.paused}
                  leadingIcon={RotateCcw}
                >
                  Redo
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    room.paused ? room.resumeInterview() : room.pauseInterview()
                  }
                  disabled={room.controlsLocked}
                  leadingIcon={room.paused ? Play : Pause}
                >
                  {room.paused ? "Play" : "Pause"}
                </Button>
                <Button
                  variant="dangerGhost"
                  size="sm"
                  onClick={() => room.setEndConfirmOpen(true)}
                  disabled={room.controlsLocked}
                  leadingIcon={Square}
                >
                  End interview
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-[family-name:var(--font-data)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                  Live transcript
                </p>
                {room.listenState === "processing" ? (
                  <Spinner className="h-4 w-4" />
                ) : null}
              </div>
              <p className="min-h-16 text-sm text-[var(--ink)]">
                {room.liveTranscript || room.manualFallback || room.helperText}
              </p>
            </div>

            {!room.speech.supported ? (
              <Textarea
                label="Type your answer"
                value={room.manualFallback}
                onChange={(e) => room.onManualChange(e.target.value)}
                placeholder="Type naturally — pause briefly to send…"
                disabled={room.busy || room.avaSpeaking || room.paused}
              />
            ) : null}

            {room.error ? <InlineAlert>{room.error}</InlineAlert> : null}
            {room.speech.error ? (
              <InlineAlert tone="warning">{room.speech.error}</InlineAlert>
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
              <Badge>{room.messages.length} turns</Badge>
            </div>
            <TranscriptPanel
              messages={room.messages}
              className="min-h-0 flex-1 pr-1"
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        open={room.endConfirmOpen}
        onClose={() => room.setEndConfirmOpen(false)}
        onConfirm={room.finishInterview}
        title="End interview?"
        description={
          room.answerCount === 0
            ? "You haven’t answered any questions yet. Ending now will mark this as incomplete with a no-hire signal — no fabricated scorecard."
            : "This will save the session recording and generate the final report from your answers so far."
        }
        confirmLabel={
          room.answerCount === 0 ? "End as incomplete" : "End & generate report"
        }
        loading={room.busy && room.listenState === "processing"}
      />
    </>
  );
}
