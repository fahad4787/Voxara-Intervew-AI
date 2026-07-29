"use client";

import { Mic, Volume2, Wifi } from "lucide-react";
import { WaveformBars } from "@/components/marketing/HeroWaveform";
import { VideoPreview } from "@/components/interview/VideoPreview";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { BodyText, DisplayTitle, Eyebrow } from "@/components/ui/Typography";
import { cn } from "@/lib/utils/cn";

const checklist = [
  {
    icon: Wifi,
    title: "Quiet connection",
    detail: "Find a calm spot with stable internet",
  },
  {
    icon: Mic,
    title: "Speak clearly",
    detail: "Follow-ups adapt to what you say",
  },
  {
    icon: Volume2,
    title: "Finish when ready",
    detail: "You can wrap up early anytime",
  },
] as const;

export function ConsentGate({
  candidateName,
  stream,
  mediaError,
  onEnableMedia,
  onAccept,
  loading,
}: {
  candidateName: string;
  stream: MediaStream | null;
  mediaError: string | null;
  onEnableMedia: () => void;
  onAccept: () => void;
  loading?: boolean;
}) {
  const ready = Boolean(stream);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-lift)]">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="consent-stage relative min-h-80 overflow-hidden bg-[var(--stage)] p-4 sm:min-h-[28rem] sm:p-6">
          <div className="consent-stage-glow" aria-hidden />
          <div className="consent-stage-grille" aria-hidden />

          <VideoPreview
            stream={stream}
            className="relative z-[1] h-full min-h-72 border border-white/10 sm:min-h-[24rem]"
            idle={
              <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
                <WaveformBars
                  variant="live"
                  className="h-16 w-full max-w-[14rem] sm:h-20 sm:max-w-[18rem]"
                />
                <div>
                  <p className="font-[family-name:var(--font-display)] text-lg text-[var(--stage-ink)]">
                    Camera standing by
                  </p>
                  <p className="mt-1.5 text-sm text-[var(--stage-muted)]">
                    Enable your camera to preview before you start
                  </p>
                </div>
              </div>
            }
          />

          <div className="absolute left-7 top-7 z-[2] sm:left-9 sm:top-9">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-[family-name:var(--font-data)] text-[11px] font-medium uppercase tracking-[0.16em]",
                ready
                  ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                  : "border-white/15 bg-[var(--ink)]/70 text-[var(--stage-ink)]",
              )}
            >
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  ready
                    ? "bg-emerald-400 rec-dot"
                    : "bg-[var(--accent)] rec-dot",
                )}
              />
              {ready ? "Camera live" : "Camera check"}
            </span>
          </div>

          {!ready ? (
            <div className="pointer-events-none absolute bottom-8 left-1/2 z-[2] hidden -translate-x-1/2 sm:block">
              <p className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.2em] text-white/35">
                Ava is ready when you are
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-10">
          <div className="reveal-on-load">
            <Eyebrow>Before you begin</Eyebrow>
            <DisplayTitle as="h2" size="md" className="mt-2">
              Hi {candidateName}
            </DisplayTitle>
            <BodyText className="mt-3 text-sm">
              This interview is voice-led by Ava. Your camera and mic stay on
              so answers can be transcribed and scored fairly.
            </BodyText>
          </div>

          <ul className="space-y-3">
            {checklist.map((item, index) => (
              <li
                key={item.title}
                className={cn(
                  "reveal-on-load flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3",
                  `reveal-delay-${index + 1}`,
                )}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  <item.icon className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[var(--ink)]">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-[var(--ink-muted)]">
                    {item.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {mediaError ? (
            <InlineAlert className="reveal-on-load reveal-delay-3">
              {mediaError}
            </InlineAlert>
          ) : null}

          <div className="reveal-on-load reveal-delay-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onEnableMedia}>
              {ready ? "Camera ready" : "Enable camera & mic"}
            </Button>
            <Button
              onClick={onAccept}
              loading={loading}
              disabled={!ready}
              brand
            >
              I consent — start interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
