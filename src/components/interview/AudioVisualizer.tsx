"use client";

import { cn } from "@/lib/utils/cn";

const BAR_HEIGHTS = [40, 70, 55, 90, 48, 78, 42] as const;

export function AudioVisualizer({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-9 items-end gap-1",
        active && "waveform-stage waveform-stage--live",
        className,
      )}
      aria-hidden
    >
      {BAR_HEIGHTS.map((height, index) => (
        <span
          key={index}
          className={cn(
            "w-1 rounded-full bg-[var(--accent)]",
            active ? "waveform-bar opacity-100" : "h-2 opacity-35",
          )}
          style={
            active
              ? {
                  height: `${height}%`,
                  animationDelay: `${(index % 5) * 90}ms`,
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
