"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function VideoPreview({
  stream,
  muted = true,
  className,
  mirror = true,
  idle,
}: {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
  mirror?: boolean;
  idle?: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-[var(--stage)]",
        className,
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500 ease-out",
          mirror && "-scale-x-100",
          stream ? "opacity-100" : "opacity-0",
        )}
      />
      {!stream ? (
        <div className="absolute inset-0">
          {idle ?? (
            <div className="flex h-full items-center justify-center text-sm text-white/60">
              Camera preview
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
