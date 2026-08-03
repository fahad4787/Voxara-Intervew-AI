"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getLocalRecordingObjectUrl,
  interviewIdFromLocalUrl,
  isLocalRecordingRef,
} from "@/lib/interview/local-recording";
import { Button } from "@/components/ui/Button";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { cn } from "@/lib/utils/cn";

const SPEEDS = [1, 2, 3] as const;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function InterviewRecordingPlayer({
  src,
  title = "Interview recording",
}: {
  src: string;
  title?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let active = true;

    void (async () => {
      setMissing(false);
      setResolvedSrc(null);

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      if (isLocalRecordingRef(src)) {
        const interviewId = interviewIdFromLocalUrl(src);
        if (!interviewId) {
          if (active) setMissing(true);
          return;
        }
        const objectUrl = await getLocalRecordingObjectUrl(interviewId);
        if (!active) {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          return;
        }
        if (!objectUrl) {
          setMissing(true);
          return;
        }
        objectUrlRef.current = objectUrl;
        setResolvedSrc(objectUrl);
        return;
      }

      setResolvedSrc(src);
    })();

    return () => {
      active = false;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [src]);

  useEffect(() => {
    if (!resolvedSrc) return;

    const audio = new Audio(resolvedSrc);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
  }, [resolvedSrc]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrent(value);
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const local = isLocalRecordingRef(src);

  return (
    <Panel>
      <PanelHeader
        title={title}
        description={
          local
            ? "Stored on this browser — play back at 1×, 2×, or 3×."
            : "Cloud recording — available across devices at 1×, 2×, or 3×."
        }
      />
      <PanelBody className="space-y-4">
        {missing ? (
          <p className="text-sm text-[var(--ink-muted)]">
            Recording isn’t available in this browser. It was saved locally and
            may only exist on the device where the interview was taken.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="soft"
                size="sm"
                iconOnly
                leadingIcon={playing ? Pause : Play}
                onClick={toggle}
                disabled={!resolvedSrc}
                aria-label={playing ? "Pause recording" : "Play recording"}
              />
              <div className="min-w-0 flex-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={current}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="recording-seek w-full"
                  aria-label="Seek recording"
                  disabled={!resolvedSrc}
                />
                <div className="mt-1.5 flex items-center justify-between font-[family-name:var(--font-data)] text-[11px] tabular-nums text-[var(--ink-muted)]">
                  <span>{formatTime(current)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                Speed
              </span>
              {SPEEDS.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setSpeed(rate)}
                  className={cn(
                    "rounded-full px-3 py-1.5 font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.12em] transition-colors",
                    speed === rate
                      ? "bg-[var(--ink)] text-white"
                      : "bg-[var(--surface-muted)] text-[var(--ink-muted)] hover:text-[var(--ink)]",
                  )}
                >
                  {rate}×
                </button>
              ))}
              <span
                className="ml-auto hidden h-1.5 w-16 overflow-hidden rounded-full bg-[var(--surface-muted)] sm:block"
                aria-hidden
              >
                <span
                  className="block h-full rounded-full bg-[var(--accent)] transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </span>
            </div>
          </>
        )}
      </PanelBody>
    </Panel>
  );
}
